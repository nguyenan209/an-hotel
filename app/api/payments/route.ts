import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (method && method !== "all") {
      where.method = method;
    }
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customer: { contains: search } },
        { homestay: { contains: search } },
      ];
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: "desc" },
        include: {
          booking: {
            include: {
              customer: true,
              homestay: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
      hasMore: skip + payments.length < total,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 