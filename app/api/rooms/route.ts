import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma Client
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const where = search
      ? {
          name: {
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const [homestays, totalItems] = await Promise.all([
      prisma.homestay.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.homestay.count({ where }),
    ]);

    return NextResponse.json({
      homestays,
      totalItems,
      hasMore: skip + limit < totalItems,
    });
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
    const body = await request.json();
    const { name, description, price, homestayId, images, bedTypes } = body;

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
        capacity: 1,
        homestay: { connect: { id: homestayId } },
        beds: {
          create: bedTypes.map((bed: { type: string; count: number }) => ({
            type: bed.type.toUpperCase(),
            count: bed.count,
          })),
        },
        images,
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
