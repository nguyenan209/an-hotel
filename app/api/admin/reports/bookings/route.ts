import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Kiểm tra token và quyền admin
    const token = getTokenData(req);
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const year = url.searchParams.get("year") || new Date().getFullYear().toString();

    // Truy vấn tất cả booking theo năm
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
    });

    const total = bookings.length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
    const pending = bookings.filter(b => b.status === "PENDING").length;

    // Thống kê theo tháng
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyStats = months.map((month, idx) => {
      const bookingsInMonth = bookings.filter(b => b.createdAt.getMonth() === idx);
      return {
        month,
        bookings: bookingsInMonth.length,
      };
    });

    return NextResponse.json({
      stats: {
        total,
        completed,
        cancelled,
        pending,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error("Get booking report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 