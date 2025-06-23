import { NextResponse } from "next/server";
import { getHomestays, searchHomestays } from "@/lib/data";
import type { SearchParams } from "@/lib/types";
import prisma from "@/lib/prisma";
import { homestaySchema } from "@/lib/schema";
import { getTokenData } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get("featured") === "true";

    const where = isFeatured ? { featured: true, isDeleted: false } : { isDeleted: false };

    const homestays = await prisma.homestay.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        price: true,
        rating: true,
        images: true,
        featured: true,
        maxGuests: true,
      },
    });

    return NextResponse.json({ homestays });
  } catch (error) {
    console.error("Error fetching homestays:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse và xác thực body request
    const body = await req.json();
    const data = homestaySchema.parse(body);
    // Lấy ownerId từ token
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const ownerId = decoded.id;
    // Tạo homestay mới trong database
    const homestay = await prisma.homestay.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        price: data.price,
        maxGuests: data.maxGuests,
        totalRooms: data.totalRooms,
        status: data.status,
        amenities: data.amenities,
        featured: data.featured,
        allowsPartialBooking: data.allowsPartialBooking,
        images: data.images,
        location: data.location,
        ownerId,
        slug: data.name,
        rating: 5,
      },
    });
    return NextResponse.json(
      { message: "Homestay created successfully", homestay },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating homestay:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
