import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "all";
    const query = searchParams.get("query") || "";

    const offset = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const where: any = {
      userId: decoded.id,
    };

    if (type !== "all") {
      where.type = type;
    }

    if (status === "read") {
      where.isRead = true;
    } else if (status === "unread") {
      where.isRead = false;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { message: { contains: query, mode: "insensitive" } },
      ];
    }

    // Lấy tổng số thông báo (không phụ thuộc vào bộ lọc)
    const totalNotifications = await prisma.notification.count({
      where: { userId: decoded.id },
    });

    // Lấy tổng số thông báo chưa đọc (không phụ thuộc vào bộ lọc)
    const unreadCount = await prisma.notification.count({
      where: { userId: decoded.id, isRead: false },
    });

    // Lấy danh sách thông báo với phân trang
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(totalNotifications / limit);

    return NextResponse.json(
      {
        notifications,
        pagination: {
          total: totalNotifications,
          unreadCount,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
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
    const { title, message, type, relatedId } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newNotification = await prisma.notification.create({
      data: {
        userId: decoded.id,
        title,
        message,
        type,
        relatedId,
      },
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
