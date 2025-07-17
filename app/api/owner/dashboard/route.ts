import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get statistics for owner's homestays
    const [
      totalHomestays,
      totalBookings,
      totalRevenue,
      monthlyBookings,
      monthlyRevenue,
      recentBookings,
      topHomestays
    ] = await Promise.all([
      // Total homestays
      prisma.homestay.count({
        where: { ownerId: decoded.id }
      }),
      // Total bookings
      prisma.booking.count({
        where: {
          homestay: { ownerId: decoded.id }
        }
      }),
      // Total revenue
      prisma.booking.aggregate({
        where: {
          homestay: { ownerId: decoded.id },
          status: BookingStatus.PAID
        },
        _sum: { totalPrice: true }
      }),
      // Monthly bookings
      prisma.booking.count({
        where: {
          homestay: { ownerId: decoded.id },
          createdAt: { gte: firstDayOfMonth }
        }
      }),
      // Monthly revenue
      prisma.booking.aggregate({
        where: {
          homestay: { ownerId: decoded.id },
          status: BookingStatus.PAID,
          createdAt: { gte: firstDayOfMonth }
        },
        _sum: { totalPrice: true }
      }),
      // Recent bookings
      prisma.booking.findMany({
        where: {
          homestay: { ownerId: decoded.id }
        },
        select: {
          id: true,
          bookingNumber: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          homestay: {
            select: {
              name: true
            }
          },
          customer: {
            select: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }),
      // Top homestays by bookings
      prisma.homestay.findMany({
        where: { ownerId: decoded.id },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          bookings: {
            _count: "desc"
          }
        },
        take: 5
      })
    ]);

    // Tính totalCustomer: số khách hàng duy nhất đã từng đặt phòng tại homestay của owner
    const uniqueCustomers = await prisma.booking.findMany({
      where: {
        homestay: { ownerId: decoded.id }
      },
      select: { customerId: true },
      distinct: ['customerId']
    });

    const totalCustomers = uniqueCustomers.length;

    // Tính revenueData: doanh thu 7 ngày gần nhất theo ngày
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6); // 7 ngày tính cả hôm nay
    const paidBookings = await prisma.booking.findMany({
      where: {
        homestay: { ownerId: decoded.id },
        status: BookingStatus.PAID,
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        createdAt: true,
        totalPrice: true
      }
    });
    // Group doanh thu theo ngày
    const revenueMap: Record<string, number> = {};
    paidBookings.forEach(b => {
      const date = b.createdAt.toISOString().slice(0, 10); // yyyy-mm-dd
      revenueMap[date] = (revenueMap[date] || 0) + b.totalPrice;
    });
    // Tạo mảng revenueData cho 7 ngày gần nhất
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      revenueData.push({
        name: d.toLocaleDateString("vi-VN"),
        revenue: revenueMap[key] || 0
      });
    }

    // Transform the data
    const dashboardData = {
      totalHomestays,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyBookings,
      monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
      totalCustomers,
      revenueData,
      recentBookings: recentBookings.map(booking => ({
        ...booking,
        homestayName: booking.homestay.name,
        customerName: booking.customer.user.name,
        homestay: undefined,
        customer: undefined
      })),
      topHomestays: topHomestays.map(homestay => ({
        ...homestay,
        totalBookings: homestay._count.bookings,
        _count: undefined
      }))
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 