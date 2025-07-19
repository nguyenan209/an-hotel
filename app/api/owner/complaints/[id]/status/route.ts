import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { ComplaintStatus, NotificationType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher/pusher";
import { getNotificationChannel } from "@/lib/notification/channels";
import { NEW_NOTIFICATION_EVENT } from "@/lib/notification/events";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Không được phép truy cập" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !Object.values(ComplaintStatus).includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    // Verify the complaint belongs to owner's homestay
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        booking: {
          homestay: {
            ownerId: decoded.id,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Không tìm thấy khiếu nại hoặc không được phép truy cập" },
        { status: 404 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            homestay: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        responses: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Gửi notification cho customer nếu status là RESOLVED
    if (status === ComplaintStatus.RESOLVED && updatedComplaint.customer?.user?.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: updatedComplaint.customer.user.id,
          type: NotificationType.COMPLAINT,
          title: "Khiếu nại của bạn đã được giải quyết",
          message: `Khiếu nại của bạn về đặt phòng #${updatedComplaint.booking?.bookingNumber || ""} đã được chủ homestay đánh dấu là đã giải quyết.`,
          isRead: false,
        },
      });
      // Gửi thông báo realtime qua Pusher
      await pusherServer.trigger(
        getNotificationChannel(updatedComplaint.customer.user.id),
        NEW_NOTIFICATION_EVENT,
        { notification }
      );
    }

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("[OWNER_COMPLAINT_STATUS_UPDATE]", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
} 