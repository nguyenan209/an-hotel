import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const { homestayId, note }: { homestayId: string; note: string } =
    await request.json();

  try {
    // Tìm giỏ hàng của người dùng
    const cart = await prisma.cart.findFirst({
      where: { customerId: customerId, isDeleted: false },
    });

    if (!cart) {
      // Nếu giỏ hàng không tồn tại, trả về lỗi
      return NextResponse.json(
        { error: "Cart not found for the user" },
        { status: 404 }
      );
    }

    // Tìm mục trong giỏ hàng
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        homestayId: homestayId,
        isDeleted: false,
      },
    });

    if (!cartItem) {
      // Nếu mục không tồn tại, trả về lỗi
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Cập nhật ghi chú cho mục trong giỏ hàng
    await prisma.cartItem.update({
      where: { id: cartItem.id, isDeleted: false },
      data: { note },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart item note:", error);
    return NextResponse.json(
      { error: "Failed to update cart item note" },
      { status: 500 }
    );
  }
}
