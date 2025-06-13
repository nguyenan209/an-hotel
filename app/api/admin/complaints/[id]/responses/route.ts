import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { responderType, responderName, message } = await req.json();
  if (!responderType || !responderName || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const response = await prisma.complaintResponse.create({
    data: {
      complaintId: id,
      responderType,
      responderName,
      message,
    },
  });
  return NextResponse.json(response);
} 