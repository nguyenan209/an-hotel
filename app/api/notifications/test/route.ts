import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Nếu bạn sử dụng Prisma để lưu thông báo
import { pusherServer } from "@/lib/pusher/pusher";
import { getTokenData } from "@/lib/auth";
import { NEW_NOTIFICATION_EVENT } from "@/lib/notification/events";
import { getNotificationChannel } from "@/lib/notification/channels";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const decoded = getTokenData(req);

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, message, type } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Lưu thông báo vào cơ sở dữ liệu (nếu cần)
    const notification = await prisma.notification.create({
      data: {
        userId: decoded.id,
        title,
        message,
        type,
        isRead: false,
      },
    });

    // Gửi thông báo qua Pusher
    await pusherServer.trigger(
      getNotificationChannel(decoded.id),
      NEW_NOTIFICATION_EVENT,
      {
        notification,
      }
    );

    return NextResponse.json(
      { message: "Notification sent successfully", notification },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error triggering notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
