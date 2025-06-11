import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;

  const where: any = {
    isDeleted: false,
  };
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { customer: { user: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [total, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { user: { select: { name: true } } } },
      },
    }),
  ]);

  return NextResponse.json({ total, complaints });
} 