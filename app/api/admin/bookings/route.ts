import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Lấy các tham số từ query string
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const bookingType = searchParams.get("bookingType") || "all";

    // Xây dựng điều kiện lọc
    const where: any = {
      isDeleted: false,
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

    // Lấy danh sách bookings từ database
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc", // Sắp xếp theo thời gian tạo mới nhất
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        bookingType: true,
        createdAt: true,
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

    // Đếm tổng số bookings để xác định `hasMore`
    const totalBookings = await prisma.booking.count({ where });
    const hasMore = skip + bookings.length < totalBookings;

    return NextResponse.json({ bookings, hasMore });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
