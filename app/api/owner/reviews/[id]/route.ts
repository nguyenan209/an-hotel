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
    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }
    const review = await prisma.review.findFirst({
      where: {
        id,
        homestay: { ownerId: decoded.id },
      },
      include: {
        homestay: true,
        customer: { include: { user: true } },
        booking: true,
      },
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review detail:", error);
    return NextResponse.json({ error: "Failed to fetch review detail" }, { status: 500 });
  }
} 