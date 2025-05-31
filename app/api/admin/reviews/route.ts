import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const ratingFilter = searchParams.get("rating") || "all";

    const where: any = {};

    if (search) {
      where.OR = [
        { homestay: { name: { contains: search, mode: "insensitive" } } },
        { customer: { user: { name: { contains: search, mode: "insensitive" } } } },
        { comment: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.status = status;
    }

    if (ratingFilter === "positive") {
      where.rating = { gte: 4 };
    } else if (ratingFilter === "negative") {
      where.rating = { lte: 2 };
    }

    const [reviews, totalItems] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          homestayId: true,
          homestay: {
            select: {
              id: true,
              name: true,
              address: true,
              images: true,
            },
          },
          customerId: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          rating: true,
          comment: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.review.count({ where }),
    ]);

    const hasMore = skip + reviews.length < totalItems;

    return NextResponse.json({ reviews, hasMore });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
