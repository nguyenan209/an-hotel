import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Kiểm tra token và quyền admin
    const token = getTokenData(req);
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    // Lấy danh sách homestays của owner
    const homestays = await prisma.homestay.findMany({
      where: { ownerId: id },
      select: {
        id: true,
        name: true,
        location: true,
        price: true,
        status: true,
        maxGuests: true,
        totalRooms: true,
        rating: true,
        images: true,
        createdAt: true,
      },
    });
    // Chuẩn hóa trường trả về cho frontend
    const result = homestays.map(h => ({
      ...h,
      rooms: h.totalRooms,
      image: h.images?.[0] || null,
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Get owner homestays error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 