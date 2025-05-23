"use client";

import { useState, useEffect } from "react";
import { CreditCard, QrCode, User, Loader2, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StripeCheckoutForm } from "@/components/checkout/stripe-checkout-form";
import { QRPaymentPopup } from "@/components/checkout/qr-payment-popup";
import { PaymentMethod } from "@prisma/client";

// Khởi tạo Stripe với public key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  totalPrice: number;
  onCreditCardSuccess: (paymentDetails: any) => void;
  onQRSuccess: () => void;
}

export function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  totalPrice,
  onCreditCardSuccess,
  onQRSuccess,
}: PaymentMethodSelectorProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountInUSD, setAmountInUSD] = useState<number>(0);
  const [isLoadingClientSecret, setIsLoadingClientSecret] = useState(false);
  const { toast } = useToast();

  // Tạo payment intent khi chọn phương thức thanh toán thẻ
  useEffect(() => {
    if (
      paymentMethod === PaymentMethod.CREDIT_CARD &&
      !clientSecret &&
      !isLoadingClientSecret
    ) {
      const createPaymentIntent = async () => {
        setIsLoadingClientSecret(true);
        try {
          // Gọi API để tạo payment intent
          const response = await fetch("/api/payment/create-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: totalPrice,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Failed to create payment intent"
            );
          }

          const data = await response.json();
          setClientSecret(data.clientSecret);
          setAmountInUSD(data.amountInUSD);
        } catch (error: any) {
          console.error("Error creating payment intent:", error);
          toast({
            title: "Lỗi kết nối",
            description:
              error.message ||
              "Không thể kết nối với cổng thanh toán. Vui lòng thử lại sau.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingClientSecret(false);
        }
      };

      createPaymentIntent();
    }
  }, [paymentMethod, clientSecret, isLoadingClientSecret, totalPrice, toast]);

  const handlePaymentMethodChange = (value: string) => {
    const method = value as PaymentMethod;
    onPaymentMethodChange(method);

    // Reset client secret when changing payment method
    if (method !== PaymentMethod.CREDIT_CARD) {
      setClientSecret(null);
    }
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>

      <RadioGroup
        value={paymentMethod}
        onValueChange={handlePaymentMethodChange}
        className="space-y-4"
      >
        <div
          className={`border rounded-lg p-4 ${
            paymentMethod === PaymentMethod.BANK_TRANSFER
              ? "border-primary bg-primary/5"
              : ""
          }`}
        >
          <div className="flex items-start">
            <RadioGroupItem value="qr_code" id="qr_code" className="mt-1" />
            <div className="ml-3 flex-1">
              <Label
                htmlFor="qr_code"
                className="text-base font-medium flex items-center"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Thanh toán bằng mã QR
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
              </p>

              {paymentMethod === PaymentMethod.BANK_TRANSFER && (
                <QRPaymentPopup
                  amount={totalPrice}
                  onPaymentSuccess={onQRSuccess}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={`border rounded-lg p-4 ${
            paymentMethod === PaymentMethod.CREDIT_CARD
              ? "border-primary bg-primary/5"
              : ""
          }`}
        >
          <div className="flex items-start">
            <RadioGroupItem
              value={PaymentMethod.CREDIT_CARD}
              id="credit_card"
              className="mt-1"
            />
            <div className="ml-3 flex-1">
              <Label
                htmlFor="credit_card"
                className="text-base font-medium flex items-center"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Thanh toán bằng thẻ tín dụng/ghi nợ
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Thanh toán an toàn với Visa, Mastercard, JCB và các loại thẻ
                khác
              </p>

              {paymentMethod === PaymentMethod.CREDIT_CARD && (
                <div className="mt-4">
                  {isLoadingClientSecret ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang kết nối với cổng thanh toán...</span>
                    </div>
                  ) : clientSecret ? (
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
                        onPaymentSuccess={onCreditCardSuccess}
                      />
                    </Elements>
                  ) : (
                    <div className="text-center py-4 text-red-500">
                      Không thể kết nối với cổng thanh toán. Vui lòng thử lại
                      sau.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`border rounded-lg p-4 ${
            paymentMethod === PaymentMethod.CASH
              ? "border-primary bg-primary/5"
              : ""
          }`}
        >
          <div className="flex items-start">
            <RadioGroupItem value={PaymentMethod.CASH} id="reception" className="mt-1" />
            <div className="ml-3">
              <Label
                htmlFor="reception"
                className="text-base font-medium flex items-center"
              >
                <User className="mr-2 h-5 w-5" />
                Thanh toán trực tiếp tại Lễ tân
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Thanh toán bằng tiền mặt hoặc thẻ khi nhận phòng
              </p>

              {paymentMethod === PaymentMethod.CASH && (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-600">Lưu ý</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    Bạn sẽ cần thanh toán đầy đủ số tiền{" "}
                    {totalPrice.toLocaleString("vi-VN")} đ khi nhận phòng. Đặt
                    phòng của bạn sẽ được giữ trong 24 giờ.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
