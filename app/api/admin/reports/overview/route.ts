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

    // Tổng doanh thu
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    });
    // Tổng số bookings
    const totalBookings = await prisma.booking.count();
    // Tổng số homestays active
    const activeHomestays = await prisma.homestay.count({ where: { status: "ACTIVE" } });
    // Điểm rating trung bình
    const avgRating = await prisma.review.aggregate({ _avg: { rating: true } });

    // Tăng trưởng (mock)
    const revenueChange = "+12.5%";
    const bookingsChange = "+8.3%";
    const homestaysChange = "+2.1%";
    const ratingChange = "-0.1";

    const reportMetrics = {
      totalRevenue: {
        value: `₫${(totalRevenue._sum.amount || 0).toLocaleString()}`,
        change: revenueChange,
        trend: "up",
        period: "vs last month",
      },
      totalBookings: {
        value: totalBookings.toLocaleString(),
        change: bookingsChange,
        trend: "up",
        period: "vs last month",
      },
      activeHomestays: {
        value: activeHomestays.toLocaleString(),
        change: homestaysChange,
        trend: "up",
        period: "vs last month",
      },
      averageRating: {
        value: avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : "-",
        change: ratingChange,
        trend: "down",
        period: "vs last month",
      },
    };

    // Các loại báo cáo
    const reportCategories = [
      {
        title: "Revenue Reports",
        description: "Financial performance and revenue analytics",
        icon: "DollarSign",
        href: "/admin/reports/revenue",
        color: "bg-green-500",
        stats: `${reportMetrics.totalRevenue.value} total revenue`,
      },
      {
        title: "Booking Reports",
        description: "Booking trends and occupancy rates",
        icon: "Calendar",
        href: "/admin/reports/bookings",
        color: "bg-blue-500",
        stats: `${reportMetrics.totalBookings.value} bookings this month`,
      },
      {
        title: "Room Usage Reports",
        description: "Room occupancy and utilization metrics",
        icon: "Home",
        href: "/admin/reports/room-usage",
        color: "bg-purple-500",
        stats: "78% average occupancy",
      },
      {
        title: "Review Reports",
        description: "Customer feedback and rating analysis",
        icon: "Star",
        href: "/admin/reports/reviews",
        color: "bg-yellow-500",
        stats: `${reportMetrics.averageRating.value} average rating`,
      },
    ];

    // Recent activity (mock)
    const recentActivity = [
      {
        type: "revenue",
        title: "Monthly revenue target achieved",
        description: "Reached 105% of monthly revenue goal",
        time: "2 hours ago",
        status: "success",
      },
      {
        type: "booking",
        title: "Peak booking period detected",
        description: "Bookings increased by 45% this week",
        time: "5 hours ago",
        status: "info",
      },
      {
        type: "review",
        title: "Review score declined",
        description: "Average rating dropped slightly",
        time: "1 day ago",
        status: "warning",
      },
      {
        type: "occupancy",
        title: "High occupancy alert",
        description: "Room occupancy reached 95% capacity",
        time: "2 days ago",
        status: "success",
      },
    ];

    return NextResponse.json({ reportMetrics, reportCategories, recentActivity });
  } catch (error) {
    console.error("Get reports overview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 