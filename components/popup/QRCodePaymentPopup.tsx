"use client";

import { AlertCircle, Check, QrCode } from "lucide-react";
import Pusher from "pusher-js";
import { useCallback, useRef, useState } from "react";

import { QrCodePayment } from "@/components/checkout/qr-code-payment";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";

// Khởi tạo Pusher client
let pusher: Pusher | null = null;

// Chỉ khởi tạo Pusher ở phía client
if (typeof window !== "undefined") {
  pusher = new Pusher("6c6b0b954c74063bd9e6", {
    cluster: "ap1",
    forceTLS: true,
  });
}

export default function QRCodePaymentPopup({
  amount,
  onPaymentSuccess,
}: {
  amount: number;
  onPaymentSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "expired"
  >("pending");
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const channelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Xử lý khi mở/đóng popup
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (isOpen) {
        // Reset state
        setTimeLeft(120);
        setPaymentStatus("pending");

        // Tạo payment session ID
        const sessionId = `payment_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        setPaymentSessionId(sessionId);

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
            const response = await fetch("/api/payment/create-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount,
                sessionId,
                type: "qr_code",
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to create payment session");
            }

            // Đăng ký kênh Pusher cho phiên thanh toán này
            if (pusher) {
              const channel = pusher.subscribe(`payment-${sessionId}`);
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
            pusher.unsubscribe(`payment-${sessionId}`);
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
    [amount, onPaymentSuccess, paymentSessionId, toast]
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
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Mở mã QR để thanh toán
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[600px] max-w-[90vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          side="top"
          align="center"
          sideOffset={0}
        >
          <div className="flex flex-col items-center space-y-6 p-6 w-full">
            <h3 className="text-xl font-bold text-center">
              Quét mã QR để thanh toán
            </h3>

            {paymentStatus === "pending" && (
              <>
                <div className="bg-primary/5 p-8 rounded-lg flex items-center justify-center w-full">
                  <QrCodePayment
                    amount={amount}
                    className="w-[400px] h-[400px]"
                    sessionId={paymentSessionId}
                  />
                </div>
                <div className="text-center bg-blue-50 p-6 rounded-lg w-full max-w-sm">
                  <p className="text-sm text-muted-foreground">
                    Mã QR hết hạn sau:
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatTime(timeLeft)}
                  </p>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                </p>
              </>
            )}

            {paymentStatus === "success" && (
              <div className="text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-green-600">
                  Thanh toán thành công!
                </h3>
                <p className="text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
