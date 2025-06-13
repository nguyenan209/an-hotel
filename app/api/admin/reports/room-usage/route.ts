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

    // Tổng số homestay
    const totalHomestays = await prisma.homestay.count();
    const activeHomestays = await prisma.homestay.count({ where: { status: "ACTIVE" } });
    const maintenanceHomestays = await prisma.homestay.count({ where: { status: "MAINTENANCE" } });
    const inactiveHomestays = await prisma.homestay.count({ where: { status: "INACTIVE" } });

    // Truy vấn tất cả booking theo năm
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
        status: "COMPLETED",
      },
      select: {
        checkIn: true,
        checkOut: true,
        createdAt: true,
      },
    });

    // Tính occupancy rate theo tháng
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyOccupancy = months.map((month, idx) => {
      // Số ngày phòng được đặt trong tháng này
      let totalNights = 0;
      bookings.forEach(b => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        // Đếm số đêm trong tháng idx
        let d = new Date(checkIn);
        while (d < checkOut) {
          if (d.getMonth() === idx) totalNights++;
          d.setDate(d.getDate() + 1);
        }
      });
      // Số phòng * số ngày trong tháng
      const daysInMonth = new Date(Number(year), idx + 1, 0).getDate();
      const totalRoomNights = activeHomestays * daysInMonth;
      const rate = totalRoomNights > 0 ? Math.round((totalNights / totalRoomNights) * 100) : 0;
      return { month, rate };
    });

    // Tính occupancy rate trung bình cả năm
    const avgOccupancyRate = Math.round(
      monthlyOccupancy.reduce((sum, m) => sum + m.rate, 0) / 12
    );

    // Thời gian lưu trú trung bình
    let totalStay = 0;
    bookings.forEach(b => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      totalStay += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
    });
    const averageStayDuration = bookings.length > 0 ? Math.round(totalStay / bookings.length) : 0;

    return NextResponse.json({
      stats: {
        totalHomestays,
        activeHomestays,
        maintenanceHomestays,
        inactiveHomestays,
        occupancyRate: avgOccupancyRate,
        averageStayDuration,
        monthlyOccupancy,
      },
    });
  } catch (error) {
    console.error("Get room usage report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 