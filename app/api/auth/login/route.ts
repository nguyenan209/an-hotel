import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { comparePassword, generateToken } from "@/lib/auth";

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
    const token = generateToken({
      id: user.id,
      customerId: user.customer?.id ?? null,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone ?? "",
      address: user.address ?? "",
      avatar: user.avatar ?? "",
    });
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        customerId: user.customer?.id ?? null,
      },
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
