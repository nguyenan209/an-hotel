import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();

    // Lấy review từ cơ sở dữ liệu
    const review = await prisma.review.findUnique({
      where: { id, isDeleted: false },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    // Chuẩn bị dữ liệu để cập nhật
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.ownerReply !== undefined) {
      if (body.ownerReply === null) {
        // Nếu ownerReply là null, xóa ownerReply và ownerReplyDate
        updateData.ownerReply = null;
        updateData.ownerReplyDate = null;
      } else {
        // Nếu ownerReply có giá trị, cập nhật ownerReply và ownerReplyDate
        updateData.ownerReply = body.ownerReply;
        updateData.ownerReplyDate = new Date();
      }
    }

    // Kiểm tra nếu không có trường hợp hợp lệ để cập nhật
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Cập nhật review trong cơ sở dữ liệu
    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Delete the review from the database
    await prisma.review.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      success: true,
      message: "Review removed successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch the review from the database
    const review = await prisma.review.findFirst({
      where: { id, isDeleted: false },
      include: {
        homestay: {
          select: {
            id: true,
            name: true,
            address: true,
            images: true,
          },
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true, // Assuming avatar is a field in the user model
              },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch review" },
      { status: 500 }
    );
  }
}
