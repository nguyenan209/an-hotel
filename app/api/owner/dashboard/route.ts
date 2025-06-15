import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

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
          status: "COMPLETED"
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
          status: "COMPLETED",
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

    // Transform the data
    const dashboardData = {
      totalHomestays,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyBookings,
      monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
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