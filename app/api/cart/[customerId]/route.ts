import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CartItem } from "@/lib/types";

// Lấy giỏ hàng của người dùng
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;

  try {
    const cart = await prisma.cart.findFirst({
      where: { customerId: customerId, isDeleted: false },
      include: {
        items: {
          where: { isDeleted: false },
          include: {
            homestay: true,
          },
        },
      },
    });

    if (!cart) {
      // Nếu giỏ hàng không tồn tại, trả về giỏ hàng rỗng
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Thêm hoặc cập nhật mục trong giỏ hàng
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const { item } = await request.json();

  try {
    // Tìm giỏ hàng của người dùng
    let cart = await prisma.cart.findFirst({
      where: { customerId: customerId, isDeleted: false },
    });

    if (!cart) {
      // Nếu giỏ hàng không tồn tại, tạo mới giỏ hàng
      cart = await prisma.cart.create({
        data: {
          customerId: customerId,
        },
      });
    }

    // Kiểm tra xem mục đã tồn tại trong giỏ hàng chưa
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        homestayId: item.homestayId,
        bookingType: item.bookingType,
        isDeleted: false,
      },
    });

    if (existingItem) {
      // Nếu mục đã tồn tại, cập nhật mục
      await prisma.cartItem.update({
        where: { id: existingItem.id, isDeleted: false },
        data: {
          checkIn: new Date(item.checkIn),
          checkOut: new Date(item.checkOut),
          guests: item.guests,
          rooms: JSON.stringify(item.rooms || []),
          note: item.note || null,
          totalPrice: item.totalPrice,
          bookingType: item.bookingType,
          nights: item.nights || 1, // Cập nhật số đêm nếu có
        },
      });
    } else {
      // Nếu mục chưa tồn tại, thêm mới mục
      console.log("Adding new item to cart:", item.rooms);
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          homestayId: item.homestayId,
          checkIn: new Date(item.checkIn),
          checkOut: new Date(item.checkOut),
          guests: item.guests,
          bookingType: item.bookingType,
          rooms: JSON.stringify(item.rooms || []),
          note: item.note || null,
          totalPrice: item.totalPrice,
          nights: item.nights || 1, // Cập nhật số đêm nếu có
        },
      });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// Xóa mục khỏi giỏ hàng
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const { homestayId }: { homestayId: string } = await request.json();

  try {
    // Tìm giỏ hàng của người dùng
    const cart = await prisma.cart.findFirst({
      where: { customerId: customerId, isDeleted: false },
    });
    
    console.log(cart)

    if (!cart) {
      // Nếu giỏ hàng không tồn tại, trả về thành công
      return NextResponse.json({ success: true });
    }

    // Xóa mục khỏi giỏ hàng
    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        homestayId: homestayId,
      },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    );
  }
}
