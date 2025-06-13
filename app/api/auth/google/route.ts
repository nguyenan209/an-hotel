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
    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, 
      customerId: user.customerId ?? "", // Assuming customerId is part of the user object
    });
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

export async function GET() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ].join(" "),
  };
  const qs = new URLSearchParams(options).toString();
  return NextResponse.redirect(`${rootUrl}?${qs}`);
}
