import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const homestay = await prisma.homestay.findUnique({
      where: {
        id: params.id,
        ownerId: decoded.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        price: true,
        status: true,
        createdAt: true,
        images: true,
        amenities: true,
        rooms: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            capacity: true,
            status: true,
            images: true,
            amenities: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            customer: {
              select: {
                user: {
                  select: {
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!homestay) {
      return NextResponse.json(
        { message: "Homestay not found" },
        { status: 404 }
      );
    }

    // Transform the data to include totalBookings and totalReviews
    const transformedHomestay = {
      ...homestay,
      totalBookings: homestay._count.bookings,
      totalReviews: homestay._count.reviews,
      _count: undefined,
      reviews: homestay.reviews.map(review => ({
        ...review,
        customerName: review.customer.user.name,
        customerAvatar: review.customer.user.avatar,
        customer: undefined
      }))
    };

    return NextResponse.json(transformedHomestay);
  } catch (error) {
    console.error("Error fetching homestay details:", error);
    return NextResponse.json(
      { error: "Failed to fetch homestay details" },
      { status: 500 }
    );
  }
} 