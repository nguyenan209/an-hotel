import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtDecode } from "jwt-decode";
import { Token } from "@/lib/types";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }
        
        console.log("Decoded token:", decoded);

        const bookings = await prisma.booking.findMany({
            where: { customerId: decoded.customerId },
            include: {
                homestay: true,
                bookingItems: {
                    include: {
                        room: true,
                    },
                },
            },
        });

        return NextResponse.json(bookings, { status: 200 });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}