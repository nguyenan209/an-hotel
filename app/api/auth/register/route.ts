import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { EmailService, OTPService } from "@/lib/services/email-service";
import { getExpireOtpTime } from "@/lib/utils";
import { getRedisClient } from '@/lib/redis';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }
    
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email,
        role: "CUSTOMER",
        status: "INACTIVE",
        provider: "credentials",
      },
    });
    await prisma.customer.create({ data: { userId: user.id } });

    // Generate OTP
    const otpCode = OTPService.generateOTP();

    // Lưu OTP vào cơ sở dữ liệu
    
    const expiryTime = getExpireOtpTime();
    await prisma.otpCode.create({
      data: {
        email,
        otp: otpCode,
        expiresAt: expiryTime,
      },
    });
    // Send OTP email
    const emailSent = await EmailService.sendOTPEmail(email, email, otpCode);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Không thể gửi email OTP" },
        { status: 500 }
      );
    }

    // Generate and store register token in Redis (TTL 5 phút)
    const registerToken = crypto.randomBytes(32).toString('hex');
    const redis = await getRedisClient();
    await redis.set(`register_token:${email}`, registerToken, { EX: 300 });

    return NextResponse.json(
      {
        message: "User registered successfully. Please activate your account using the OTP sent to your email.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: registerToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
