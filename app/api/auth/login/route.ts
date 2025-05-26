import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { comparePassword, generateToken } from "@/lib/auth";
import { Token } from "@/lib/types";

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
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customer: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "Account is not active" },
        { status: 401 }
      );
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    const userPayload: Token = {
      id: user.id,
      customerId: user.customer?.id ?? "",
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone ?? "",
      address: user.address ?? "",
      avatar: user.avatar ?? "",
    }
    
    const token = generateToken(userPayload);
    return NextResponse.json({
      message: "Login successful",
      user: userPayload,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
