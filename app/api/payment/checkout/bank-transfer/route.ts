import {
  PaymentMethod,
  BookingStatus,
  PaymentStatus,
  PaymentSessionStatus,
} from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/utils";
import { CHANNEL_PAYMENT_CONFIRM } from "@/lib/const";
import { pusherServer } from "@/lib/pusher/pusher";
import { getPaymentChannel } from "@/lib/notification/channels";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountHolder, bank, accountNumber, transferContent, sessionId } =
      body;

    const paymentSession = await prisma.paymentSession.findUnique({
      where: { sessionId },
    });
    if (!paymentSession) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    if (!paymentSession.payload) {
      return NextResponse.json(
        { error: "Payment session payload is missing" },
        { status: 400 }
      );
    }

    const payload = paymentSession.payload as {
      cartItemIds: string[];
      totalAmount: number;
    };
    const cartItemIds = payload.cartItemIds;

    if (!cartItemIds || cartItemIds.length === 0) {
      return NextResponse.json(
        { error: "No cart items found in session" },
        { status: 400 }
      );
    }
    const cartItems = await prisma.cartItem.findMany({
      where: {
        isDeleted: false,
        id: {
          in: cartItemIds,
        },
      },
      include: {
        homestay: true,
      },
    });

    const totalPrice = payload.totalAmount;
    const items = cartItems.map((cartItem) => ({
      homestayId: cartItem.homestayId,
      homestay: cartItem.homestay,
      checkIn: cartItem.checkIn,
      checkOut: cartItem.checkOut,
      guests: cartItem.guests,
      nights: cartItem.nights,
      bookingType: cartItem.bookingType,
      note: cartItem.note,
      rooms: cartItem.rooms,
      totalPrice,
    }));

    const bookingData = {
      totalAmount: totalPrice,
      currency: "VND",
      items,
      status: BookingStatus.PENDING,
    };

    // Tạo một bookingNumber chung cho tất cả các booking trong lần đặt phòng này
    const bookingNumber = generateBookingNumber(bookingData);

    const user = await prisma.user.findUnique({
      where: {
        id: paymentSession.userId,
        isDeleted: false,
      },
      include: {
        customer: true, // Bao gồm thông tin khách hàng nếu cần
      },
    });

    // Kiểm tra xem khách hàng đã tồn tại hay chưa
    let customer = user?.customer;

    if (!customer) {
      // Nếu khách hàng không tồn tại, tạo mới khách hàng
      customer = await prisma.customer.create({
        data: {
          userId: paymentSession.userId,
        },
      });
    }

    const customerData = { connect: { id: customer.id } };

    // Tạo danh sách các booking
    const createdBookings = await Promise.all(
      bookingData.items.map(async (item: any) => {
        // Tạo booking cho từng homestay
        const createdBooking = await prisma.booking.create({
          data: {
            bookingNumber, // Dùng chung bookingNumber cho tất cả các booking
            customer: customerData, // Liên kết hoặc tạo khách hàng
            homestay: {
              connect: { id: item.homestayId }, // Explicitly connect homestay
            },
            checkIn: new Date(item.checkIn),
            checkOut: new Date(item.checkOut),
            guests: item.guests,
            totalPrice: item.totalPrice,
            bookingType: item.bookingType,
            status: BookingStatus.PAID,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            specialRequests: item.note,
            bookingItems: {
              create: JSON.parse(item.rooms).map((room: any) => ({
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

        // Lưu thông tin thanh toán cho từng booking
        const transactionId = `AN-HOTEL-TX${Math.floor(
          100000 + Math.random() * 900000
        )}`;
        const createdPayment = await prisma.payment.create({
          data: {
            bookingId: createdBooking.id,
            amount: item.totalPrice,
            method: PaymentMethod.BANK_TRANSFER,
            status: PaymentStatus.PAID,
            transactionId: transactionId,
            paymentDate: new Date(),
            notes: transferContent,
            paymentDetails: JSON.stringify({
              accountHolder,
              bank,
              accountNumber,
              transferContent,
              amount: item.totalPrice,
              sessionId,
            }),
          },
        });

        return {
          booking: createdBooking,
          payment: createdPayment,
        };
      })
    );

    await prisma.paymentSession.update({
      where: { sessionId: paymentSession.sessionId },
      data: {
        status: PaymentSessionStatus.SUCCESS,
        updatedAt: new Date(),
      },
    });

    await prisma.cartItem.updateMany({
      where: {
        id: {
          in: cartItemIds,
        },
        isDeleted: false,
      },
      data: {
        isDeleted: true, // Đánh dấu các cart item là đã xóa
        updatedAt: new Date(),
      },
    });

    await pusherServer.trigger(
      getPaymentChannel(sessionId),
      CHANNEL_PAYMENT_CONFIRM,
      {
        status: "confirmed",
        sessionId,
        amount: payload.totalAmount,
        message: "Payment confirmed successfully",
      }
    );

    // Trả về danh sách các booking và thanh toán đã tạo
    return NextResponse.json({
      success: true,
      message: "Bookings and payments processed successfully",
      data: createdBookings,
    });
  } catch (error) {
    console.error("=== CHECKOUT PAYMENT API ERROR ===");
    console.error("Error processing payment:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
