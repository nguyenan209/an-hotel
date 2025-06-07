import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = { role: UserRole.OWNER };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const owners = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        homestays: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const data = owners.map((owner) => ({
      ...owner,
      totalHomestays: owner.homestays.length,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching owners:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch owners" }, { status: 500 });
  }
} 