import { type NextRequest, NextResponse } from "next/server";
import { EmailService, OTPService } from "@/lib/services/email-service";

// Mock OTP storage (trong thực tế, lưu vào database hoặc Redis)
const otpStorage = new Map<
  string,
  { otp: string; createdAt: Date; attempts: number }
>();

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

    // Store OTP (trong thực tế, lưu vào database với expiry)
    otpStorage.set(email, {
      otp: otpCode,
      createdAt: new Date(),
      attempts: 0,
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
