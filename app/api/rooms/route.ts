import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;
    const homestayId = searchParams.get("homestayId") || undefined;
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Xây dựng điều kiện lọc
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (homestayId && homestayId !== "all") {
      where.homestayId = homestayId;
    }

    // Truy vấn từ Prisma
    const [rooms, totalItems] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          capacity: true,
          price: true,
          status: true,
          homestayId: true,
          homestay: {
            select: {
              id: true,
              name: true,
            },
          },
          images: true,
          beds: true,
          amenities: true,
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      rooms,
      totalItems,
      hasMore: skip + limit < totalItems,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      homestayId,
      images,
      bedTypes,
      status,
      amenities,
      capacity,
    } = body;

    if (!name || !description || !homestayId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        description,
        price,
        capacity,
        status,
        homestay: { connect: { id: homestayId } },
        beds: {
          create: bedTypes.map((bed: { type: string; count: number }) => ({
            type: bed.type.toUpperCase(),
            count: bed.count,
          })),
        },
        images,
        amenities,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
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
