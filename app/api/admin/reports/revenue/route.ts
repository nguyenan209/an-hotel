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

    // Truy vấn doanh thu theo năm từ bảng Payment
    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        paymentDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      },
      select: {
        amount: true,
        paymentDate: true,
      },
    });

    // Tạo mảng doanh thu theo tháng
    const revenueByMonth: { [key: string]: number } = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(month => {
      revenueByMonth[month] = 0;
    });

    payments.forEach(payment => {
      const month = months[payment.paymentDate.getMonth()];
      revenueByMonth[month] += payment.amount;
    });

    const revenueData = months.map(month => ({
      month,
      revenue: revenueByMonth[month],
    }));

    return NextResponse.json({ revenueData });
  } catch (error) {
    console.error("Get revenue report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 