import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    // Tìm complaint thuộc về homestay của owner
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        booking: {
          homestay: {
            ownerId: decoded.id,
          },
        },
      },
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
            checkIn: true,
            checkOut: true,
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
    if (!complaint) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(complaint);
  } catch (error) {
    console.error("[OWNER_COMPLAINT_DETAIL_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 