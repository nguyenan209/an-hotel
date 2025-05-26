import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;

  try {
    // Tìm giỏ hàng của người dùng
    const cart = await prisma.cart.findFirst({
      where: { customerId: customerId, isDeleted: false },
    });

    if (!cart) {
      // Nếu giỏ hàng không tồn tại, trả về thành công
      return NextResponse.json({ success: true });
    }

    // Đánh dấu tất cả các mục trong giỏ hàng là "đã xóa"
    await prisma.cartItem.updateMany({
      where: { cartId: cart.id },
      data: { isDeleted: true },
    });

    // Đánh dấu giỏ hàng là "đã xóa"
    await prisma.cart.update({
      where: { id: cart.id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
