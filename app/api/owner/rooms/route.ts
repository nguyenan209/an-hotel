import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const homestayId = searchParams.get("homestayId") || "";
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Lấy danh sách homestayId của owner
    const ownerHomestays = await prisma.homestay.findMany({
      where: { ownerId: decoded.id, isDeleted: false },
      select: { id: true, name: true },
    });
    const ownerHomestayIds = ownerHomestays.map(h => h.id);

    // Nếu filter theo homestayId thì chỉ lấy id đó (nếu nó thuộc owner)
    let filterHomestayIds = ownerHomestayIds;
    if (homestayId && ownerHomestayIds.includes(homestayId)) {
      filterHomestayIds = [homestayId];
    }

    const where: any = {
      homestayId: { in: filterHomestayIds },
      isDeleted: false,
    };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          homestay: { select: { id: true, name: true } },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      rooms,
      hasMore: skip + rooms.length < total,
      homestays: ownerHomestays, // Để filter combobox
    });
  } catch (error) {
    console.error("Error fetching owner rooms:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 