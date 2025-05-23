"use client";

import type React from "react";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface StripeCheckoutFormProps {
  clientSecret: string;
  amountInUSD: number;
  onPaymentSuccess: (paymentDetails: any) => void;
}

export function StripeCheckoutForm({
  clientSecret,
  amountInUSD,
  onPaymentSuccess,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Submit error:", submitError);
        toast({
          title: "Lỗi xác thực",
          description:
            submitError.message ||
            "Đã xảy ra lỗi khi xác thực thông tin thanh toán. Vui lòng thử lại.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Xác nhận thanh toán với client secret
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Lỗi thanh toán",
          description:
            error.message ||
            "Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Thanh toán thành công
        toast({
          title: "Thanh toán thành công",
          description: "Thẻ của bạn đã được ghi nợ thành công.",
          variant: "default",
        });

        // Chuẩn bị thông tin thanh toán để gửi lên API
        const paymentDetails = {
          paymentIntentId: paymentIntent.id,
          cardLast4: paymentIntent.payment_method?.card?.last4,
          cardBrand: paymentIntent.payment_method?.card?.brand,
          amountInUSD: amountInUSD,
          exchangeRate: 24000, // Tỷ giá giả định
        };

        // Gọi callback thành công với thông tin thanh toán
        onPaymentSuccess(paymentDetails);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Lỗi không xác định",
        description:
          error.message ||
          "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Số tiền sẽ được quy đổi sang USD để xử lý
          thanh toán: <strong>${amountInUSD.toFixed(2)}</strong>
        </p>
      </div>
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <div className="mt-4">
        <AddressElement
          options={{
            mode: "shipping",
            defaultValues: {
              name: "",
              address: {
                country: "VN",
              },
            },
          }}
        />
      </div>
      <div className="mt-4">
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Xác nhận thanh toán"
          )}
        </Button>
      </div>
    </form>
  );
}
