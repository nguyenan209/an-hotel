import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    // Kiểm tra token và quyền admin
    const token = getTokenData(req);
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    // Tổng doanh thu (tổng payment đã PAID)
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    });
    // Tổng số bookings
    const totalBookings = await prisma.booking.count();
    // Tổng số customers
    const totalCustomers = await prisma.customer.count();
    // Tổng số homestays
    const totalHomestays = await prisma.homestay.count();

    // Revenue 7 ngày gần nhất
    const today = new Date();
    const days = 7;
    const revenueData: { name: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(today, i);
      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));
      const payments = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID",
          paymentDate: { gte: start, lte: end },
        },
      });
      revenueData.push({
        name: format(start, "EEE"),
        revenue: payments._sum.amount || 0,
      });
    }

    const stats = {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalBookings,
      totalCustomers,
      totalHomestays,
      // Các trường khác nếu cần
    };
    return NextResponse.json({ stats, revenueData });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 