import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    console.log("decoded", decoded);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const where: any = {
      ownerId: decoded.id,
      isDeleted: false,
    };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const [homestays, total] = await Promise.all([
      prisma.homestay.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          address: true,
          price: true,
          rating: true,
          status: true,
          images: true,
        },
      }),
      prisma.homestay.count({ where }),
    ]);
    
    console.log("where", where, limit, skip);
    

    return NextResponse.json({
      homestays,
      hasMore: skip + homestays.length < total,
    });
  } catch (error) {
    console.error("Error fetching owner homestays:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 