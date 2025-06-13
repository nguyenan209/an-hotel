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
    const owner = await prisma.user.findUnique({
      where: { id, role: "OWNER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...owner,
      joinDate: owner.createdAt,
    });
  } catch (error) {
    console.error("Get owner error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Kiểm tra token và quyền admin
    const token = getTokenData(req);
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, address, status, avatar } = body;
    const updated = await prisma.user.update({
      where: { id, role: "OWNER" },
      data: { name, email, phone, address, status, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update owner error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 