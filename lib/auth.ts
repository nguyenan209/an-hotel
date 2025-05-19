import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const hashPassword = async (password: string): Promise<string> =>
  hash(password, 12);
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => compare(password, hashedPassword);
export const generateToken = (userId: string, role: string): string =>
  sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
export const verifyToken = (
  token: string
): { userId: string; role: string } => {
  try {
    return verify(token, JWT_SECRET) as { userId: string; role: string };
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
