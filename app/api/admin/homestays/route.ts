import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure you have Prisma setup and configured

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // Lấy giá trị filter status từ query
    const search = searchParams.get("search"); // Lấy giá trị search từ query
    const page = parseInt(searchParams.get("page") || "1", 10); // Lấy số trang, mặc định là 1
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Lấy số lượng item mỗi trang, mặc định là 10

    // Xây dựng điều kiện lọc
    const where: any = { isDeleted: false }; // Điều kiện mặc định là không bị xóa

    if (status && status !== "all") {
      where.status = status; // Lọc theo status nếu có
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } }, // Tìm kiếm theo name
        { address: { contains: search, mode: "insensitive" } }, // Tìm kiếm theo address
      ];
    }

    // Tính toán offset và limit
    const offset = (page - 1) * limit;

    // Truy vấn cơ sở dữ liệu với điều kiện lọc và phân trang
    const [homestays, total] = await Promise.all([
      prisma.homestay.findMany({
        where,
        skip: offset,
        take: limit,
      }),
      prisma.homestay.count({ where }), // Đếm tổng số bản ghi phù hợp
    ]);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = homestays.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    // Định dạng dữ liệu trả về
    const formattedHomestays = homestays.map((homestay) => ({
      id: homestay.id,
      name: homestay.name,
      address: homestay.address,
      price: homestay.price,
      rating: homestay.rating,
      status: homestay.status,
    }));

    return NextResponse.json({
      homestays: formattedHomestays,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching homestays:", error);
    return NextResponse.json(
      { error: "Failed to fetch homestays" },
      { status: 500 }
    );
  }
}
