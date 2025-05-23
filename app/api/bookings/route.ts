import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma client
import { BookingStatus, PaymentStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      homestayId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      bookingType,
      paymentMethod,
      specialRequests,
      rooms,
    } = body;

    // Kiểm tra các trường bắt buộc
    if (
      !userId ||
      !homestayId ||
      !checkInDate ||
      !checkOutDate ||
      !guests ||
      !totalPrice ||
      !bookingType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Tạo booking mới
    const newBooking = await prisma.booking.create({
      data: {
        user: { connect: { id: userId } },
        homestayId,
        checkIn: new Date(checkInDate),
        checkOut: new Date(checkOutDate),
        guests,
        totalPrice,
        bookingType,
        paymentMethod,
        specialRequests,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        bookingNumber: `BK-${Date.now()}`,
        customer: { connect: { id: userId } },
        homestay: { connect: { id: homestayId } },
      },
    });

    // Nếu có danh sách phòng, tạo các BookingItem
    if (rooms && Array.isArray(rooms)) {
      const bookingItems = rooms.map((room: any) => ({
        bookingId: newBooking.id,
        roomId: room.roomId,
        price: room.price,
        quantity: room.quantity || 1,
        discount: room.discount || 0,
        notes: room.notes || null,
      }));

      await prisma.bookingItem.createMany({
        data: bookingItems,
      });
    }

    // Trả về booking vừa tạo cùng với các BookingItem
    const createdBooking = await prisma.booking.findUnique({
      where: { id: newBooking.id },
      include: {
        bookingItems: true, // Bao gồm các BookingItem liên quan
      },
    });

    return NextResponse.json(createdBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
