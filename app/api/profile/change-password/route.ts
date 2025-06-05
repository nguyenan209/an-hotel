import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData, comparePassword, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const decoded = getTokenData(request);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = decoded.id;
        const { oldPassword, newPassword } = await request.json();
        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.provider !== "credentials") {
            return NextResponse.json(
                { error: "Không thể đổi mật khẩu cho tài khoản này" },
                { status: 400 }
            );
        }
        if (!user.password) {
            return NextResponse.json(
                { error: "Tài khoản không có mật khẩu" },
                { status: 400 }
            );
        }
        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: "Mật khẩu cũ không đúng" },
                { status: 400 }
            );
        }
        const hashed = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Đổi mật khẩu thất bại" },
            { status: 500 }
        );
    }
}
