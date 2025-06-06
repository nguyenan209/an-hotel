"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function PaymentStep({
  data,
  onComplete,
  onBack,
}: PaymentStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const SETUP_FEE = 500000;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/host/register/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: data.registrationId,
        }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || "Không thể tạo phiên thanh toán");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Thanh toán phí đăng ký Host
          </CardTitle>
          <CardDescription>
            Phí một lần để trở thành Host trên nền tảng HomeStay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-lg">Phí đăng ký Host</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(SETUP_FEE)}
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>✓ Xét duyệt hồ sơ và hỗ trợ setup</p>
            <p>✓ Hướng dẫn tạo listing đầu tiên</p>
            <p>✓ Hỗ trợ khách hàng ưu tiên</p>
            <p>✓ Commission 12% cho mỗi booking</p>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Checkout Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Thông tin thanh toán
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>Thanh toán được xử lý an toàn bởi Stripe</span>
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              DEMO MODE
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCheckout}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Thanh toán với Stripe
          </Button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}