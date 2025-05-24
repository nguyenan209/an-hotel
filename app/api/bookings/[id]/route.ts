import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã cấu hình Prisma trong dự án
import { getTokenData } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decoded = getTokenData(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Tìm booking theo ID từ cơ sở dữ liệu
    const booking = await prisma.booking.findUnique({
      where: { id, isDeleted: false }, // Kiểm tra isDeleted để chỉ lấy các booking chưa bị xóa
      include: {
        homestay: true, // Bao gồm thông tin homestay liên quan
        bookingItems: {
          include: {
            room: true, // Bao gồm thông tin phòng liên quan
          },
        },
      },
    });

    // Nếu không tìm thấy booking, trả về lỗi 404
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Trả về dữ liệu booking
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
