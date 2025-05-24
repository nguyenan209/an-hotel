import { type NextRequest, NextResponse } from "next/server";
import { OTPService, EmailService } from "@/lib/services/email-service";

// Mock OTP storage (trong thực tế, lưu vào database hoặc Redis)
const otpStorage = new Map<
  string,
  { otp: string; createdAt: Date; attempts: number }
>();

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email và mã OTP là bắt buộc" },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedData = otpStorage.get(email);

    if (!storedData) {
      return NextResponse.json(
        { error: "Không tìm thấy mã OTP hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (OTPService.isOTPExpired(storedData.createdAt, 5)) {
      otpStorage.delete(email);
      return NextResponse.json({ error: "Mã OTP đã hết hạn" }, { status: 400 });
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      otpStorage.delete(email);
      return NextResponse.json(
        { error: "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return NextResponse.json(
        {
          error: "Mã OTP không chính xác",
          attemptsLeft: 3 - storedData.attempts,
        },
        { status: 400 }
      );
    }

    // OTP is correct - remove from storage
    otpStorage.delete(email);

    // In real app, update user status in database
    // await updateUserVerificationStatus(email, true)

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
