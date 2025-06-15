import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { ResponderType } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
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

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create response
    const response = await prisma.complaintResponse.create({
      data: {
        complaintId: id,
        responderType: ResponderType.OWNER,
        responderName: user.name,
        message: message.trim(),
      },
    });

    // Get updated complaint with all responses
    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id },
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
    console.error("[OWNER_COMPLAINT_MESSAGE_CREATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 