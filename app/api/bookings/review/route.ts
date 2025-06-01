import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client
import { getTokenData } from "@/lib/auth"; // Hàm để lấy thông tin người dùng từ token

export async function GET(request: NextRequest) {
  try {
    // Lấy thông tin người dùng từ token
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy homestayId từ query params
    const { searchParams } = new URL(request.url);
    const homestayId = searchParams.get("homestayId");

    if (!homestayId) {
      return NextResponse.json(
        { error: "Missing homestayId in query params" },
        { status: 400 }
      );
    }

    // Truy vấn review của người dùng hiện tại cho homestayId
    const review = await prisma.review.findFirst({
      where: {
        homestayId: homestayId,
        customerId: decoded.customerId,
        isDeleted: false,
      },
    });

    if (!review) {
      return NextResponse.json(
        { message: "No review found for this user and homestay" },
        { status: 404 }
      );
    }

    return NextResponse.json({ review }, { status: 200 });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
