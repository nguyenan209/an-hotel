import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { ComplaintPriority } from "@prisma/client";

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
    const { priority } = await request.json();

    if (!priority || !Object.values(ComplaintPriority).includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority" },
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
      data: { priority },
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

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("[OWNER_COMPLAINT_PRIORITY_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 