"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/cart-item";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/cartStore";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [notes, setNotes] = useState("");

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-muted-foreground mb-6">
            Hãy thêm homestay vào giỏ hàng để tiến hành đặt phòng
          </p>
          <Link href="/search">
            <Button>Tìm homestay</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        <Button variant="outline" onClick={clearCart}>
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.homestayId} item={item} />
            ))}
          </div>
          {items.length > 0 && (
            <div className="mt-6 border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Ghi chú đặc biệt</h3>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Thêm ghi chú về yêu cầu đặc biệt của bạn (ví dụ: phòng tầng cao, giường thêm, thời gian nhận phòng...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Chúng tôi sẽ cố gắng đáp ứng các yêu cầu của bạn tùy thuộc vào
                tình trạng sẵn có.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Số lượng homestay:
                </span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng số đêm:</span>
                <span>
                  {items.reduce((total, item) => total + item.nights, 0)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>

            <Link href="/checkout/payment">
              <Button className="w-full">Tiến hành thanh toán</Button>
            </Link>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Giá đã bao gồm thuế và phí
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
