import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { subject, description, priority, bookingId } = await req.json();
    if (!subject || !description || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Lấy user/customer từ token
    const decoded = getTokenData(req);
    const userId = decoded?.id;
    let customerId = decoded?.customerId;

    // Lấy thông tin booking nếu có bookingId
    if (bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (booking) {
        customerId = booking.customerId;
      }
    }

    if (!userId || !customerId) {
      return NextResponse.json({ error: "Missing user or customer info" }, { status: 400 });
    }

    // Tạo complaint mới
    const complaint = await prisma.complaint.create({
      data: {
        subject,
        description,
        priority: priority.toUpperCase(),
        bookingId: bookingId || undefined,
        customerId,
        userId,
        type: 'OTHER',
        status: "OPEN",
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const customerId = searchParams.get("customerId");
    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (customerId) where.customerId = customerId;
    const complaints = await prisma.complaint.findMany({ where });
    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("Get complaints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 