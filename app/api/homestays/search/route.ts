import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { SearchParams } from "@/lib/types";
import { Homestay } from "@prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Parse query parameters
  const params: SearchParams = {
    location: url.searchParams.get("location") || undefined,
    checkIn: url.searchParams.get("checkIn") || undefined,
    checkOut: url.searchParams.get("checkOut") || undefined,
    guests: url.searchParams.get("guests")
      ? Number.parseInt(url.searchParams.get("guests")!)
      : undefined,
    minPrice: url.searchParams.get("minPrice")
      ? Number.parseInt(url.searchParams.get("minPrice")!)
      : undefined,
    maxPrice: url.searchParams.get("maxPrice")
      ? Number.parseInt(url.searchParams.get("maxPrice")!)
      : undefined,
    rating: url.searchParams.get("rating")
      ? Number.parseFloat(url.searchParams.get("rating")!)
      : undefined,
    amenities: url.searchParams.get("amenities")
      ? url.searchParams.get("amenities")!.split(",")
      : undefined,
  };

  try {
    const where: any = {
      isDeleted: false,
      featured: true,
    };

    if (params.location) {
      where.address = {
        contains: params.location,
        mode: "insensitive",
      };
    }

    if (params.guests) {
      where.maxGuests = {
        gte: params.guests,
      };
    }

    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) {
        where.price.gte = params.minPrice;
      }
      if (params.maxPrice) {
        where.price.lte = params.maxPrice;
      }
    }

    if (params.rating) {
      where.rating = {
        gte: params.rating,
      };
    }

    if (params.amenities && params.amenities.length > 0) {
      where.amenities = {
        hasEvery: params.amenities,
      };
    }
    
    console.log("WHERE", where);

    // Fetch homestays from Prisma
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
    
    console.log("Fetched homestays:", homestays);

    return NextResponse.json(homestays);
  } catch (error) {
    console.error("Error fetching homestays:", error);
    return NextResponse.json(
      { error: "Failed to fetch homestays" },
      { status: 500 }
    );
  }
}
