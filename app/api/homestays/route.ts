import { NextResponse } from "next/server";
import { getHomestays, searchHomestays } from "@/lib/data";
import type { SearchParams } from "@/lib/types";
import prisma from "@/lib/prisma";
import { homestaySchema } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search params
    const params: SearchParams = {
      location: searchParams.get("location") || undefined,
      checkIn: searchParams.get("checkIn") || undefined,
      checkOut: searchParams.get("checkOut") || undefined,
      guests: searchParams.get("guests")
        ? Number.parseInt(searchParams.get("guests")!)
        : undefined,
      minPrice: searchParams.get("minPrice")
        ? Number.parseInt(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number.parseInt(searchParams.get("maxPrice")!)
        : undefined,
      rating: searchParams.get("rating")
        ? Number.parseFloat(searchParams.get("rating")!)
        : undefined,
      amenities: searchParams.get("amenities")
        ? searchParams.get("amenities")!.split(",")
        : undefined,
    };

    // If there are search params, use searchHomestays, otherwise get all homestays
    const homestays = Object.keys(params).some(
      (key) => params[key as keyof SearchParams] !== undefined
    )
      ? await searchHomestays(params)
      : await getHomestays();

    return NextResponse.json(homestays);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
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
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    const ownerId = decodedToken.userId;

    if (!ownerId) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
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
