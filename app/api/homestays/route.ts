import { NextResponse } from "next/server";
import { getHomestays, searchHomestays } from "@/lib/data";
import type { SearchParams } from "@/lib/types";
import prisma from "@/lib/prisma";
import { homestaySchema } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get("featured") === "true";

    const where = isFeatured ? { featured: true } : {};

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

export async function POST(request: Request) {
  try {
    // Parse và xác thực body request
    const body = await request.json();
    const data = homestaySchema.parse(body);
    // Lấy ownerId từ authorization token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    const ownerId = decodedToken.userId;

    if (!ownerId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

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
