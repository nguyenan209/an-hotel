import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const bookingType = searchParams.get("bookingType") || "all";

    // Build where clause
    const where: any = {
      isDeleted: false,
      homestay: {
        ownerId: decoded.id
      }
    };

    if (search) {
      where.OR = [
        { homestayName: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.status = status;
    }

    if (bookingType !== "all") {
      where.bookingType = bookingType;
    }

    // Get bookings from database
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        bookingNumber: true,
        totalPrice: true,
        status: true,
        bookingType: true,
        createdAt: true,
        checkIn: true,
        checkOut: true,
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
              },
            }
          },
        },
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

    // Count total bookings for pagination
    const totalBookings = await prisma.booking.count({ where });
    const hasMore = skip + bookings.length < totalBookings;

    return NextResponse.json({ bookings, hasMore });
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
} 