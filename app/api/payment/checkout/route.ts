import { PaymentMethod, BookingStatus, PaymentStatus, NotificationType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { generateBookingNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { paymentMethod, bookingData, paymentDetails } = body;

    // Tạo một bookingNumber chung cho tất cả các booking trong lần đặt phòng này
    const bookingNumber = generateBookingNumber(bookingData);

    // Kiểm tra xem khách hàng đã tồn tại hay chưa
    let customer = await prisma.customer.findUnique({
      where: {
        id: decoded.customerId,
        isDeleted: false,
      },
    });

    if (!customer) {
      // Nếu khách hàng không tồn tại, tạo mới khách hàng
      customer = await prisma.customer.create({
        data: {
          userId: decoded.id,
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
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: paymentMethod,
            specialRequests: item.note,
            bookingItems: {
              create: item.rooms.map((room: any) => ({
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
            method: paymentMethod,
            status:
              paymentMethod === PaymentMethod.CASH
                ? PaymentStatus.PENDING
                : PaymentStatus.PAID,
            transactionId:
              paymentMethod === PaymentMethod.CASH ? null : transactionId,
            paymentDate:
              paymentMethod === PaymentMethod.CASH ? undefined : new Date(),
            notes:
              paymentMethod === PaymentMethod.CREDIT_CARD
                ? `Card Last 4: ${paymentDetails?.cardLast4}, Brand: ${paymentDetails?.cardBrand}`
                : paymentMethod === PaymentMethod.BANK_TRANSFER
                  ? `Bank: ${paymentDetails?.bankName}, Account: ${paymentDetails?.accountNumber}`
                  : null,
          },
        });
        
        // Tạo notification tới người dùng về booking mới
        await prisma.notification.create({
          data: {
            userId: decoded.id,
            type: NotificationType.BOOKING,
            title: "Booking Confirmation",
            message: `Your booking #${createdBooking.bookingNumber} has been created successfully.`,
            isRead: false,
          },
        });

        return {
          booking: createdBooking,
          payment: createdPayment,
        };
      })
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
