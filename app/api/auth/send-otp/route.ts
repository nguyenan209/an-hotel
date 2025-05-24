import { type NextRequest, NextResponse } from "next/server";
import { EmailService, OTPService } from "@/lib/services/email-service";
import prisma from "@/lib/prisma";
import { getExpireOtpTime } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    if (!email || !userName) {
      return NextResponse.json(
        { error: "Email và tên người dùng là bắt buộc" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otpCode = OTPService.generateOTP();

    const expiryTime = getExpireOtpTime();
    await prisma.otpCode.create({
      data: {
        email,
        otp: otpCode,
        expiresAt: expiryTime,
      },
    });

    // Send OTP email
    const emailSent = await EmailService.sendOTPEmail(email, userName, otpCode);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Không thể gửi email OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn",
      expiryTime: 5 * 60 * 1000, // 5 minutes in milliseconds
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
