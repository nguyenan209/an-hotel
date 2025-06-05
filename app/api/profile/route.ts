import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth"; // Hàm lấy user từ token

export async function GET(request: NextRequest) {
    try {
        const decoded = getTokenData(request);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = decoded.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                avatar: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                bio: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const decoded = getTokenData(request);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = decoded.id;
        const body = await request.json();
        const { fullName, phone, address, avatar, bio } = body;

        console.log(fullName, phone, address, avatar, bio);

        // Cập nhật thông tin user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: fullName,
                phone,
                address,
                avatar,
                updatedAt: new Date(),
                bio,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                avatar: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                bio: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
