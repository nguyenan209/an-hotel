import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma client
import { v4 as uuidv4 } from "uuid";
import { PaymentSessionStatus } from "@prisma/client";
import { getTokenData } from "@/lib/auth";
import { compareHashes } from "@/lib/hash";
import { calculateCartTotal } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const decodedToken = getTokenData(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemIds, paymentSessionId, type } = body;

    // Kiểm tra các trường bắt buộc
    if (!decodedToken.id || !paymentSessionId || !type || !cartItemIds.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validPayload = compareHashes({ cartItemIds }, paymentSessionId);

    if (!validPayload) {
      return NextResponse.json(
        { error: "Invalid booking payload" },
        { status: 400 }
      );
    }
    
    const carts = await prisma.cartItem.findMany({
      where: {
        isDeleted: false,
        id: {
          in: cartItemIds,
        },
      },
      include: {
        homestay: true,
      }
    });
    
    console.log("Carts found:", carts);
    
    if (carts.length !== cartItemIds.length) {
      return NextResponse.json(
        { error: "Some carts not found" },
        { status: 404 }
      );
    }
    
    const totalAmount = carts.reduce((sum, item) => sum + item.totalPrice, 0);

    // Lưu session vào cơ sở dữ liệu
    const paymentSession = await prisma.paymentSession.upsert({
      where: { sessionId: paymentSessionId },
      create: {
        userId: decodedToken.id,
        payload: {
          totalAmount,
          ownerName: "AN-HOMESTAY",
          content: "Payment for booking: " + totalAmount.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          }),
          cartItemIds: cartItemIds,
        },
        sessionId: paymentSessionId,
        status: PaymentSessionStatus.PENDING,
      },
      update: {
        userId: decodedToken.id,
        payload: {
          totalAmount,
          ownerName: "AN-HOMESTAY",
          content: "Payment for booking: " + totalAmount.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          }),
          cartItemIds: cartItemIds,
        },
        status: PaymentSessionStatus.PENDING,
      },
    });

    // Trả về thông tin session
    return NextResponse.json(
      {
        success: true,
        sessionId: paymentSession.sessionId,
        paymentUrl: `${process.env.NEXT_PUBLIC_API_URL}/payment/session/${paymentSession.sessionId}`,
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
