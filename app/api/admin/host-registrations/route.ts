import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    if (status && status !== "all") {
      where.user = { status };
    }

    const registrations = await prisma.hostRegistration.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        homestayAddress: true,
        registrationStep: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        rejectedReason: true,
        user: {
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
            }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("Error fetching host registrations:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch host registrations" }, { status: 500 });
  }
} 