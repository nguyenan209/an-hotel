import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const year = url.searchParams.get("year") || new Date().getFullYear().toString();
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${parseInt(year) + 1}-01-01`);

    // Lấy tất cả review trong năm
    const reviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      include: {
        customer: { select: { user: { select: { name: true } } } },
        homestay: { select: { name: true } },
      },
    });

    // Tổng số review
    const totalReviews = reviews.length;
    // Rating trung bình
    const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2) : 0;
    // Số pending/approved/rejected
    const pendingReviews = reviews.filter(r => r.status === "PENDING").length;
    const approvedReviews = reviews.filter(r => r.status === "APPROVED").length;
    const rejectedReviews = reviews.filter(r => r.status === "REJECTED").length;
    // Phân phối rating
    const ratingDistribution = [1,2,3,4,5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    }));
    // 10 review mới nhất
    const recentReviews = reviews
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        customerName: r.customer?.user?.name || "",
        homestayName: r.homestay?.name || "",
        rating: r.rating,
        comment: r.comment,
        status: r.status.toLowerCase(),
        createdAt: r.createdAt,
      }));

    return NextResponse.json({
      stats: {
        totalReviews,
        averageRating,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        ratingDistribution,
      },
      recentReviews,
    });
  } catch (error) {
    console.error("Get review report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 