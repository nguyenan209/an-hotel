import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { BookingStatus, HostPaymentStatus, HostRegistrationStep, PaymentMethod, PaymentStatus } from "@prisma/client";
import { STRIPE_PAYMENT_INTENT_TYPE, CHANNEL_PAYMENT_CONFIRM } from "@/lib/const";
import { pusherServer } from "@/lib/pusher/pusher";
import { getPaymentChannel } from "@/lib/notification/channels";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;
        if (metadata.type === STRIPE_PAYMENT_INTENT_TYPE) {
          const { bookingNumber, cartItemIds, paymentSessionId } = metadata;

          console.log("paymentIntent.succeeded", paymentIntent);

          // Lấy payment session
          const paymentSession = await prisma.paymentSession.findUnique({
            where: { sessionId: paymentSessionId },
          });

          if (!paymentSession) {
            throw new Error("Payment session not found");
          }

          const payload = paymentSession.payload as {
            cartItemIds: string[];
            totalAmount: number;
          };

          console.log("payload", payload);

          // Lấy thông tin cart items
          const cartItems = await prisma.cartItem.findMany({
            where: {
              isDeleted: false,
              id: {
                in: JSON.parse(cartItemIds as string),
              },
            },
            include: {
              homestay: true,
            },
          });

          // Lấy thông tin user
          const user = await prisma.user.findUnique({
            where: {
              id: paymentSession.userId,
              isDeleted: false,
            },
            include: {
              customer: true,
            },
          });

          // Kiểm tra và tạo customer nếu chưa tồn tại
          let customer = user?.customer;
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                userId: paymentSession.userId,
              },
            });
          }

          const customerData = { connect: { id: customer.id } };

          // Tạo danh sách các booking
          const createdBookings = await Promise.all(
            cartItems.map(async (cartItem) => {
              // Tạo booking cho từng homestay
              const createdBooking = await prisma.booking.create({
                data: {
                  bookingNumber,
                  customer: customerData,
                  homestay: {
                    connect: { id: cartItem.homestayId },
                  },
                  checkIn: new Date(cartItem.checkIn),
                  checkOut: new Date(cartItem.checkOut),
                  guests: cartItem.guests,
                  totalPrice: cartItem.totalPrice,
                  bookingType: cartItem.bookingType,
                  status: BookingStatus.PAID,
                  paymentStatus: PaymentStatus.PAID,
                  paymentMethod: PaymentMethod.CREDIT_CARD,
                  specialRequests: cartItem.note,
                  bookingItems: {
                    create: JSON.parse(cartItem.rooms as string).map((room: any) => ({
                      room: {
                        connect: { id: room.roomId },
                      },
                      price: room.pricePerNight,
                      quantity: 1,
                      discount: 0,
                      notes: room.notes || null,
                    })),
                  },
                },
                include: {
                  bookingItems: {
                    include: {
                      room: true,
                    },
                  },
                },
              });

              // Tạo payment record
              const createdPayment = await prisma.payment.create({
                data: {
                  bookingId: createdBooking.id,
                  amount: cartItem.totalPrice,
                  method: PaymentMethod.CREDIT_CARD,
                  status: PaymentStatus.PAID,
                  transactionId: paymentIntent.id,
                  paymentDate: new Date(),
                  paymentDetails: JSON.stringify({
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                  }),
                },
              });

              return {
                booking: createdBooking,
                payment: createdPayment,
              };
            })
          );

          // Cập nhật trạng thái payment session
          await prisma.paymentSession.update({
            where: { sessionId: paymentSessionId },
            data: {
              status: "SUCCESS",
              updatedAt: new Date(),
            },
          });

          // Xóa các cart items đã thanh toán
          await prisma.cartItem.updateMany({
            where: {
              id: {
                in: JSON.parse(cartItemIds as string),
              },
              isDeleted: false,
            },
            data: {
              isDeleted: true,
              updatedAt: new Date(),
            },
          });

          // Gửi thông báo qua Pusher
          await pusherServer.trigger(
            getPaymentChannel(paymentSessionId),
            CHANNEL_PAYMENT_CONFIRM,
            {
              status: "confirmed",
              sessionId: paymentSessionId,
              amount: paymentIntent.amount,
              message: "Payment confirmed successfully",
            }
          );
        }
        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        console.log("PaymentIntent failed.", failedPaymentIntent);
        break;

      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const email =
          session.customer_email ||
          (session.customer_details && session.customer_details.email);

        if (!email) {
          console.error("No email found in checkout.session.completed event");
          break;
        }

        await prisma.hostRegistration.update({
          where: { email: email, paymentStatus: HostPaymentStatus.PENDING },
          data: { paymentStatus: HostPaymentStatus.PAID, registrationStep: HostRegistrationStep.VERIFICATION },
        });

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
