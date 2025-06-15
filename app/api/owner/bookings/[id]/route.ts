import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find booking and verify it belongs to the owner's homestay
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        isDeleted: false,
        homestay: {
          ownerId: decoded.id
        }
      },
      select: {
        id: true,
        bookingNumber: true,
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