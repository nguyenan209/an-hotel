import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy query parameters từ request
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10); // Trang hiện tại
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Số lượng thông báo mỗi trang

    // Tính toán offset
    const offset = (page - 1) * limit;

    // Lấy tổng số thông báo
    const totalNotifications = await prisma.notification.count({
      where: {
        userId: decoded.id,
      },
    });

    // Lấy danh sách thông báo với phân trang
    const notifications = await prisma.notification.findMany({
      where: {
        userId: decoded.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalNotifications / limit);

    return NextResponse.json(
      {
        notifications,
        pagination: {
          total: totalNotifications,
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
        userId: decoded.customerId,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isRead } = body;

    const updatedNotification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead,
      },
    });

    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
