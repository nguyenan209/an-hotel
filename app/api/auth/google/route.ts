import { NextResponse } from "next/server";
import {
  verifyGoogleToken,
  createOrUpdateUserFromGoogle,
  generateToken,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        { message: "Missing Google token" },
        { status: 400 }
      );
    }
    const googleUser = await verifyGoogleToken(token);
    if (!googleUser) {
      return NextResponse.json(
        { message: "Invalid Google token" },
        { status: 401 }
      );
    }
    const user = await createOrUpdateUserFromGoogle(googleUser);
    const jwtToken = generateToken(user.id, user.role);
    return NextResponse.json({
      message: "Google login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: jwtToken,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
