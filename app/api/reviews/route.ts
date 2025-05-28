import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { ReviewStatus } from "@prisma/client";

// Lấy danh sách đánh giá
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const homestayId = searchParams.get("homestayId");
    const status = searchParams.get("status") || "APPROVED";

    const offset = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const where: any = {
      status,
    };

    if (homestayId) {
      where.homestayId = homestayId;
    }

    console.log(JSON.stringify({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    }))
    // Lấy danh sách đánh giá
    const reviews = await prisma.review.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });
    
    console.log(reviews);

    // Tổng số đánh giá
    const total = await prisma.review.count({ where });

    return NextResponse.json(
      {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { homestayId, bookingId, rating, comment } = body;

    if (!homestayId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const homestay = await prisma.homestay.findUnique({
      where: { id: homestayId },
      select: { ownerId: true },
    });
    if (!homestay) {
      return NextResponse.json(
        { error: "Homestay not found" },
        { status: 404 }
      );
    }
    const ownerId = homestay.ownerId;
    if (!ownerId) {
      return NextResponse.json(
        { error: "Homestay owner not found" },
        { status: 404 }
      );
    }

    // Kiểm tra xem customer có tồn tại không
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Kiểm tra xem owner có tồn tại không
    const existingOwner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!existingOwner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Tạo đánh giá mới
    const review = await prisma.review.create({
      data: {
        customer: {
          connect: { id: decoded.customerId },
        },
        homestay: {
          connect: { id: homestayId },
        },
        owner: {
          connect: { id: ownerId },
        },
        booking: bookingId
          ? { connect: { id: bookingId } }
          : undefined,
        rating,
        comment,
        status: "PENDING",
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
