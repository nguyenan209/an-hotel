import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma client

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Kiểm tra nếu sessionId không tồn tại
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Tìm session thanh toán trong cơ sở dữ liệu
    const paymentSession = await prisma.paymentSession.findUnique({
      where: { sessionId },
    });

    // Nếu không tìm thấy session
    if (!paymentSession) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    // Trả về thông tin session
    return NextResponse.json(paymentSession, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
