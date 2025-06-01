import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client
import { getTokenData } from "@/lib/auth"; // Hàm để lấy thông tin người dùng từ token

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Lấy ID từ route động
    const body = await request.json();
    const { isHelpful } = body;

    if (!id || typeof isHelpful !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Lấy thông tin người dùng từ token
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cập nhật số lượng hữu ích của review
    const review = await prisma.review.update({
      where: { id, isDeleted: false },
      data: {
        helpfulCount: {
          increment: isHelpful ? 1 : -1, // Sử dụng cú pháp chính xác
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating helpful count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
