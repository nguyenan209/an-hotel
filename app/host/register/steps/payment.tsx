"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeCheckoutForm } from "@/components/checkout/stripe-checkout-form";
import { useToast } from "@/components/ui/use-toast";

// Khởi tạo Stripe với public key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountInUSD, setAmountInUSD] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const SETUP_FEE = 500000; // Fixed setup fee

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/host/register/step2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: data.registrationId,
          amount: SETUP_FEE,
          paymentMethod: "CREDIT_CARD",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setClientSecret(result.clientSecret);
        setAmountInUSD(result.amountInUSD);
      } else {
        setError(result.error || "Không thể tạo payment intent");
      }
    } catch (error) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    onComplete({
      paymentIntentId: paymentDetails.paymentIntentId,
      amount: SETUP_FEE,
      last4: paymentDetails.cardLast4,
      brand: paymentDetails.cardBrand,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Đang khởi tạo thanh toán...</span>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Button onClick={createPaymentIntent} className="flex-1">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Stripe Payment Form */}
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
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#0f172a",
                  },
                },
              }}
            >
              <StripeCheckoutForm
                clientSecret={clientSecret}
                amountInUSD={amountInUSD}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
