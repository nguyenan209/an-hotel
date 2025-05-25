import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the path to match your project structure

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Booking ID is required" },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        bookingType: true,
        createdAt: true,
        guests: true,
        homestay: {
          select: {
            id: true,
            name: true,
            address: true,
            images: true,
            rooms: {
              select: {
                id: true,
                name: true,
                price: true,
                capacity: true,
                status: true,
              },
            },
          },
        },
        paymentMethod: true,
        paymentStatus: true,
        checkIn: true,
        checkOut: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
