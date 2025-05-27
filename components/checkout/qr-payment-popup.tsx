"use client";

import { useState, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { QrCode, Check, AlertCircle } from "lucide-react";
import Pusher from "pusher-js";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { QrCodePayment } from "@/components/checkout/qr-code-payment";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BookingPayload } from "@/lib/types";
import { calculateCartTotal, generateBookingNumber } from "@/lib/utils";
import { PaymentMethod } from "@prisma/client";
import { useCartStore } from "@/lib/store/cartStore";

// Khởi tạo Pusher client
let pusher: Pusher | null = null;

// Chỉ khởi tạo Pusher ở phía client
if (typeof window !== "undefined") {
  pusher = new Pusher("6c6b0b954c74063bd9e6", {
    cluster: "ap1",
    forceTLS: true,
  });
}

interface QRPaymentPopupProps {
  onPaymentSuccess: () => void;
}

export function QRPaymentPopup({ onPaymentSuccess }: QRPaymentPopupProps) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "expired"
  >("pending");
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const [sessionUrl, setSessionUrl] = useState<string>("");
  const channelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const cartItems = useCartStore((state) => state.items);
  console.log("Cart items:", cartItems);

  // Xử lý khi mở/đóng popup
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (isOpen) {
        // Reset state
        setTimeLeft(120);
        setPaymentStatus("pending");
        const cartItemIds = cartItems.map((item) => item.id);
        const bookingNumber = generateBookingNumber({
          cartItemIds,
        });
        setPaymentSessionId(bookingNumber);
        // Khởi tạo đếm ngược
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              setPaymentStatus("expired");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Gọi API để tạo phiên thanh toán
        const createPaymentSession = async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-session`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  cartItemIds,
                  type: PaymentMethod.BANK_TRANSFER,
                  paymentSessionId: bookingNumber,
                }),
              }
            );

            if (!response.ok) {
              throw new Error("Failed to create payment session");
            }

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || "Failed to create payment session");
            }
            setSessionUrl(data.paymentUrl);

            // Đăng ký kênh Pusher cho phiên thanh toán này
            if (pusher) {
              const channel = pusher.subscribe(`payment-${bookingNumber}`);
              channelRef.current = channel;

              channel.bind("payment-status", (data: any) => {
                console.log("Received payment status update:", data);

                if (data.status === "confirmed") {
                  setPaymentStatus("success");

                  // Dừng đếm ngược
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                  }

                  // Gọi callback thành công
                  setTimeout(() => {
                    onPaymentSuccess();
                    setOpen(false);
                  }, 2000);
                }
              });
            }
          } catch (error) {
            console.error("Error creating payment session:", error);
            toast({
              title: "Lỗi",
              description:
                "Không thể tạo phiên thanh toán. Vui lòng thử lại sau.",
              variant: "destructive",
            });
          }
        };

        createPaymentSession();

        // Cleanup function
        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          // Hủy đăng ký kênh Pusher
          if (channelRef.current && pusher) {
            pusher.unsubscribe(`payment-${bookingNumber}`);
            channelRef.current = null;
          }
        };
      } else {
        // Cleanup khi đóng popup
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Hủy đăng ký kênh Pusher
        if (channelRef.current && pusher && paymentSessionId) {
          pusher.unsubscribe(`payment-${paymentSessionId}`);
          channelRef.current = null;
        }
      }
    },
    [onPaymentSuccess, paymentSessionId, toast, cartItems]
  );

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="mt-4">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Mở mã QR để thanh toán
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-0">
          <div className="flex flex-col items-center space-y-4 p-6 w-full">
            <h3 className="text-xl font-bold text-center">
              Quét mã QR để thanh toán
            </h3>

            {paymentStatus === "pending" && (
              <>
                {/* Phần 1: QR Code */}
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center w-full max-w-[300px]">
                  <QrCodePayment
                    className="w-[250px] h-[250px]"
                    sessionId={paymentSessionId}
                    sessionUrl={sessionUrl}
                  />
                </div>

                {/* Số tiền và hướng dẫn */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    Số tiền: {calculateCartTotal(cartItems).toLocaleString()} ₫
                  </p>
                  <p className="text-sm text-gray-500">
                    Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh
                    toán
                  </p>
                </div>

                {/* Phần 2: Thời gian đếm ngược */}
                <div className="text-center bg-blue-50 p-4 rounded-lg w-full max-w-sm">
                  <p className="text-sm text-gray-600">Mã QR hết hạn sau:</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </>
            )}

            {paymentStatus === "success" && (
              <div className="text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-green-600">
                  Thanh toán thành công!
                </h3>
                <p className="text-sm text-gray-500">
                  Đơn hàng của bạn đang được xử lý...
                </p>
              </div>
            )}

            {paymentStatus === "expired" && (
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-red-600">
                  Mã QR đã hết hạn
                </h3>
                <p className="text-sm text-gray-500">
                  Vui lòng đóng và mở lại mã QR để thử lại
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleOpenChange(false)}
                >
                  Đóng
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
