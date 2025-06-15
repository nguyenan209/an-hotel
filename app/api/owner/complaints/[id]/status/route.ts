import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { ComplaintStatus, NotificationType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher/pusher";
import { getNotificationChannel } from "@/lib/notification/channels";
import { NEW_NOTIFICATION_EVENT } from "@/lib/notification/events";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!status || !Object.values(ComplaintStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
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
        { error: "Complaint not found or unauthorized" },
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
          title: "Your complaint has been resolved",
          message: `Your complaint regarding booking #${updatedComplaint.booking?.bookingNumber || ""} has been marked as resolved by the owner.`,
          isRead: false,
        },
      });
      // Gửi notification realtime qua Pusher
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 