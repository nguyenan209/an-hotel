import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      customer: { select: { user: { select: { name: true, email: true, phone: true } } } },
      user: { select: { name: true, email: true, phone: true } },
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          checkIn: true,
          checkOut: true,
          homestay: { select: { id: true, name: true } },
        },
      },
      responses: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(complaint);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.priority) updateData.priority = data.priority;
  if (data.assignedTo) updateData.assignedTo = data.assignedTo;
  if (data.resolution) updateData.resolution = data.resolution;
  if (data.status === "RESOLVED") updateData.resolvedAt = new Date();
  const updated = await prisma.complaint.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
} 