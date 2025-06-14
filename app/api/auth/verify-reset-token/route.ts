import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token là bắt buộc" },
        { status: 400 }
      );
    }

    // Verify JWT token
    const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        type: string;
      };
    } catch (error) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    // Verify token type
    if (decoded.type !== "password_reset") {
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 400 }
      );
    }

    // Check if token exists in database and is not used
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        userId: decoded.userId,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã được sử dụng" },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      valid: true,
      userId: decoded.userId,
      email: decoded.email 
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
} 