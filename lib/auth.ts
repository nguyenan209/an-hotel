import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { Token } from "./types";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

const NEXT_PUBLIC_JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const hashPassword = async (password: string): Promise<string> =>
  hash(password, 12);

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => compare(password, hashedPassword);

export const generateToken = (payload: Token): string =>
  sign(payload, NEXT_PUBLIC_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const verifyToken = (token: string): Token => {
  try {
    return verify(token, NEXT_PUBLIC_JWT_SECRET) as Token;
  } catch {
    throw new Error("Invalid token");
  }
};

export const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch {
    throw new Error("Invalid Google token");
  }
};

export const createOrUpdateUserFromGoogle = async (googleUser: any) => {
  const { email, name, picture } = googleUser;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email,
        avatar: picture,
        password: "",
        provider: "google",
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });
    await prisma.customer.create({ data: { userId: user.id } });
  }
  return user;
};

export function getTokenData(request: NextRequest) {
  try {
    // Lấy token từ header Authorization hoặc cookie
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : request.cookies.get("token")?.value;

    if (!token) {
      throw new Error("No token provided");
    }

    // Giải mã token bằng secret key
    const decoded = verify(token, process.env.NEXT_PUBLIC_JWT_SECRET || "default_secret") as Token;
    console.log("decoded", decoded);
    return decoded; // Trả về thông tin từ token
  } catch (error) {
    console.error("Error decoding token:", error);
    return null; // Trả về null nếu token không hợp lệ
  }
}
