import { type NextRequest, NextResponse } from "next/server";
import { OTPService, EmailService } from "@/lib/services/email-service";
import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email và mã OTP là bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: { email, otp },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP không hợp lệ" }, { status: 400 });
    }

    // Check if OTP is expired
    if (
      OTPService.isOTPExpired(
        otpRecord.createdAt,
        parseInt(process.env.NEXT_PUBLIC_OTP_EXPIRATION_TIME || "5", 10)
      )
    ) {
      await prisma.otpCode.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json({ error: "Mã OTP đã hết hạn" }, { status: 400 });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 3) {
      await prisma.otpCode.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      return NextResponse.json(
        {
          error: "Mã OTP không chính xác",
          attemptsLeft: 3 - otpRecord.attempts,
        },
        { status: 400 }
      );
    }

    // OTP is correct - remove from storage
    await prisma.otpCode.delete({
      where: { id: otpRecord.id },
    });

    // Activate user account
    await prisma.user.update({
      where: { email },
      data: { status: UserStatus.ACTIVE },
    });

    // Send welcome email
    const userName = email.split("@")[0]; // Simple extraction, use real name from database
    await EmailService.sendWelcomeEmail(email, userName);

    return NextResponse.json({
      success: true,
      message: "Email đã được xác nhận thành công",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
