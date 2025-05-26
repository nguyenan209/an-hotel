import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma client
import { v4 as uuidv4 } from "uuid";
import { PaymentSessionStatus } from "@prisma/client";
import { getTokenData } from "@/lib/auth";
import { compareHashes } from "@/lib/hash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const decodedToken = getTokenData(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingPayload, paymentSessionId, type } = body;

    // Kiểm tra các trường bắt buộc
    if (!decodedToken.id || !paymentSessionId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validPayload = compareHashes(bookingPayload, paymentSessionId);

    if (!validPayload) {
      return NextResponse.json(
        { error: "Invalid booking payload" },
        { status: 400 }
      );
    }

    // Lưu session vào cơ sở dữ liệu
    const paymentSession = await prisma.paymentSession.create({
      data: {
        userId: decodedToken.id,
        payload: bookingPayload,
        sessionId: paymentSessionId,
        status: PaymentSessionStatus.SUCCESS,
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
