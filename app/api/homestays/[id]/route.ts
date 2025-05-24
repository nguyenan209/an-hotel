import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Truy vấn cơ sở dữ liệu để lấy thông tin homestay
    const homestay = await prisma.homestay.findUnique({
      where: { id: id, isDeleted: false },
    });

    // Nếu không tìm thấy homestay, trả về lỗi 404
    if (!homestay) {
      return new NextResponse(JSON.stringify({ error: "Homestay not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Trả về dữ liệu homestay
    return NextResponse.json(homestay);
  } catch (error) {
    console.error("Error fetching homestay:", error);

    // Trả về lỗi 500 nếu có lỗi xảy ra
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    // Đảm bảo Prisma Client được ngắt kết nối sau khi xử lý xong
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Cập nhật thông tin homestay trong cơ sở dữ liệu
    const updatedHomestay = await prisma.homestay.update({
      where: { id, isDeleted: false },
      data: body,
    });

    // Trả về dữ liệu homestay đã được cập nhật
    return NextResponse.json(updatedHomestay);
  } catch (error) {
    console.error("Error updating homestay:", error);

    // Trả về lỗi 500 nếu có lỗi xảy ra
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    // Đảm bảo Prisma Client được ngắt kết nối sau khi xử lý xong
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: homestayId } = await params;

    // Xóa Homestay
    await prisma.homestay.update({
      where: { id: homestayId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "Homestay deleted successfully" });
  } catch (error) {
    console.error("Error deleting homestay:", error);
    return NextResponse.json(
      { error: "Failed to delete homestay" },
      { status: 500 }
    );
  }
}
