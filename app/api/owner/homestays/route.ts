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

    // Build where clause
    const where: any = {
      ownerId: decoded.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.status = status;
    }

    // Get homestays from database
    const homestays = await prisma.homestay.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        address: true,
        status: true,
        createdAt: true,
        images: true,
        price: true,
        _count: {
          select: {
            rooms: true,
            bookings: true,
          },
        },
      },
    });

    // Transform the data to include totalRooms and totalBookings
    const transformedHomestays = homestays.map(homestay => ({
      ...homestay,
      totalRooms: homestay._count.rooms,
      totalBookings: homestay._count.bookings,
      _count: undefined
    }));

    // Count total homestays for pagination
    const totalHomestays = await prisma.homestay.count({ where });
    const hasMore = skip + homestays.length < totalHomestays;

    return NextResponse.json({ homestays: transformedHomestays, hasMore });
  } catch (error) {
    console.error("Error fetching owner homestays:", error);
    return NextResponse.json(
      { error: "Failed to fetch homestays" },
      { status: 500 }
    );
  }
} 