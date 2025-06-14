import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("today", today);

    // Find all bookings with status PAID and checkout date is today
    const bookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PAID,
        checkOut: {
          equals: today,
        },
      },
    });

    // Update status to COMPLETED
    const updatedBookings = await prisma.booking.updateMany({
      where: {
        id: {
          in: bookings.map((booking) => booking.id),
        },
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedBookings.count} bookings to COMPLETED status`,
      updatedCount: updatedBookings.count,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking status" },
      { status: 500 }
    );
  }
} 