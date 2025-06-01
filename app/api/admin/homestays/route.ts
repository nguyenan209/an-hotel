import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Xây dựng điều kiện lọc
    const where: any = { isDeleted: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    // Truy vấn từ Prisma
    const [homestays, totalItems] = await Promise.all([
      prisma.homestay.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          address: true,
          price: true,
          rating: true,
          status: true,
        },
      }),
      prisma.homestay.count({ where }),
    ]);

    // Tính toán hasMore
    const hasMore = skip + homestays.length < totalItems;

    return NextResponse.json({
      homestays,
      totalItems,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching homestays:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
