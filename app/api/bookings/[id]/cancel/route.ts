import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Kiểm tra booking có tồn tại và thuộc về user hiện tại không
    const booking = await prisma.booking.findFirst({
      where: {
        id: id,
        customer: {
          userId: decoded.id,
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Kiểm tra xem booking có thể hủy không
    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái booking thành CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: {
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
} 