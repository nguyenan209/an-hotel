import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token và mật khẩu là bắt buộc" },
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
} 