import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const ratingFilter = searchParams.get("rating") || "all";

    const where: any = {
      homestay: {
        ownerId: decoded.id
      }
    };

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
          ownerReply: true,
          ownerReplyDate: true,
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

export async function PUT(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, ownerReply, status } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Verify that the review belongs to one of the owner's homestays
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        homestay: {
          ownerId: decoded.id
        }
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    // Nếu có status thì cập nhật trạng thái review
    if (status) {
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { status },
      });
      return NextResponse.json(updatedReview);
    }

    // Nếu có ownerReply thì cập nhật phản hồi của chủ nhà
    if (ownerReply !== undefined) {
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          ownerReply,
          ownerReplyDate: new Date(),
        },
      });
      return NextResponse.json(updatedReview);
    }

    return NextResponse.json(
      { error: "No valid update field provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { reviewId } = body;
    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }
    // Kiểm tra quyền owner
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        homestay: {
          ownerId: decoded.id
        }
      }
    });
    if (!review) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }
    await prisma.review.delete({ where: { id: reviewId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
} 