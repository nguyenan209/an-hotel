import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Token } from "@/lib/types";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // 1. Lấy access_token từ Google
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // 2. Lấy thông tin user từ Google
  const userInfoRes = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
  );
  const googleUser = await userInfoRes.json();

  // 3. Kiểm tra user đã tồn tại chưa
  let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

  if (!user) {
    // Tạo user mới
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        provider: "google",
        status: "ACTIVE",
        role: "CUSTOMER",
      },
    });
  }

  let customer = await prisma.customer.findUnique({
    where: {
      userId: user.id,
    },
  });
  if (!customer) {
    customer = await prisma.customer.create({ data: { userId: user.id } });
  }


  // 4. Tạo JWT
  const userPayload: Token = {
    id: user.id,
    customerId: customer.id ?? "",
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone ?? "",
    address: user.address ?? "",
    avatar: user.avatar ?? "",
  }
  const token = jwt.sign(userPayload,
    process.env.NEXT_PUBLIC_JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // 5. Redirect về FE kèm token
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?token=${token}`);
} 