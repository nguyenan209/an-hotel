import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client
import { getTokenData } from "@/lib/auth"; // Hàm để lấy thông tin người dùng từ token

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Lấy ID từ route động
    const body = await request.json();
    const { isHelpful } = body;

    if (!id || typeof isHelpful !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Lấy thông tin người dùng từ token
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decoded.id;

    if (isHelpful) {
      // Kiểm tra xem bản ghi đã tồn tại hay chưa
      const existingHelpful = await prisma.helpfulReview.findUnique({
        where: {
          reviewId_userId: {
            reviewId: id,
            userId: userId,
          },
        },
      });

      if (existingHelpful) {
        // Nếu bản ghi đã tồn tại và bị đánh dấu là xóa, cập nhật lại
        if (existingHelpful.isDeleted) {
          await prisma.helpfulReview.update({
            where: {
              reviewId_userId: {
                reviewId: id,
                userId: userId,
              },
            },
            data: {
              isDeleted: false,
            },
          });
        } else {
          // Nếu bản ghi đã tồn tại và không bị xóa, trả về lỗi
          return NextResponse.json(
            { error: "You have already marked this review as helpful" },
            { status: 400 }
          );
        }
      } else {
        // Thêm bản ghi mới vào bảng HelpfulReview
        await prisma.helpfulReview.create({
          data: {
            reviewId: id,
            userId: userId,
          },
        });
      }

      // Tăng số lượng hữu ích của review
      const review = await prisma.review.update({
        where: { id },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ review });
    } else {
      // Xóa bản ghi khỏi bảng HelpfulReview
      await prisma.helpfulReview.update({
        where: {
          reviewId_userId: {
            reviewId: id,
            userId: userId,
          },
        },
        data: {
          isDeleted: true,
        },
      });

      // Giảm số lượng hữu ích của review
      const review = await prisma.review.update({
        where: { id },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ review });
    }
  } catch (error) {
    console.error("Error updating helpful count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
