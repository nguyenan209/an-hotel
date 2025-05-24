import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma client
import { v4 as uuidv4 } from "uuid";
import { PaymentSessionStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const header = request.headers.get("Authorization");
    const token = header?.split(" ")[1]; // Lấy token từ header
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    const ownerId = decodedToken.userId;

    const { bookingId, amount, type } = body;

    // Kiểm tra các trường bắt buộc
    if (!ownerId || !amount || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Tạo session ID duy nhất
    const sessionId = uuidv4();

    // Lưu session vào cơ sở dữ liệu
    const paymentSession = await prisma.paymentSession.create({
      data: {
        userId: ownerId,
        bookingId: bookingId || null,
        amount,
        sessionId,
        status: PaymentSessionStatus.PENDING,
      },
    });

    // Trả về thông tin session
    return NextResponse.json(
      {
        success: true,
        sessionId: paymentSession.sessionId,
        paymentUrl: `${process.env.NEXT_PUBLIC_API_URL}/payment/${paymentSession.sessionId}`, // URL thanh toán
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
