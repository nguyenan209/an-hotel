import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EmailService } from "@/lib/services/email-service";
import { getForgotPasswordEmailHTML } from "@/lib/email-templates/forgot-password";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng với email này" }, { status: 404 });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'password_reset'
      },
      process.env.NEXT_PUBLIC_JWT_SECRET || "",
      { expiresIn: "15m" }
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Xoá token cũ chưa dùng (nếu có)
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    });

    // Lưu token mới
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Tạo link reset
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Gửi email
    const html = getForgotPasswordEmailHTML({
      userName: user.name,
      resetUrl,
      expiryMinutes: 15,
    });
    await EmailService.sendEmail({
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu - Homestay Booking",
      html,
    });

    return NextResponse.json({ message: "Đã gửi email khôi phục mật khẩu!" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại sau." }, { status: 500 });
  }
} 