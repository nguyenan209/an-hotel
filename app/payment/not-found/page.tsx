import Link from "next/link";
import { AlertTriangle, Home, ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentNotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Payment ID không tồn tại
          </CardTitle>
          <CardDescription className="text-gray-600">
            Không tìm thấy thông tin thanh toán với ID này. Vui lòng kiểm tra
            lại hoặc thử các hành động bên dưới.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-2">Có thể do:</p>
            <ul className="text-left space-y-1">
              <li>• Payment ID đã hết hạn</li>
              <li>• Link thanh toán không chính xác</li>
              <li>• Giao dịch đã được xử lý</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full" variant="default">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </Link>

            <Link href="/cart" className="block">
              <Button className="w-full" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Xem giỏ hàng
              </Button>
            </Link>

            <Link href="/contact" className="block">
              <Button className="w-full" variant="ghost">
                <Phone className="mr-2 h-4 w-4" />
                Liên hệ hỗ trợ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
