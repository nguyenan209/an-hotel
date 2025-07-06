"use client";

import { QrCodePayment } from "@/components/checkout/qr-code-payment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getPaymentChannel } from "@/lib/notification/channels";
import { CHANNEL_PAYMENT_CONFIRM } from "@/lib/notification/events";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { useCartStore } from "@/lib/store/cartStore";
import { calculateCartTotal, generateBookingNumber } from "@/lib/utils";
import { PaymentMethod } from "@prisma/client";
import { AlertCircle, Check, QrCode, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { items } = useCartStore();
  const router = useRouter();

  // Xử lý khi mở/đóng popup
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (isOpen) {
        // Reset state
        setTimeLeft(120);
        setPaymentStatus("pending");
        const cartItemIds = items.map((item) => item.id);
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
            if (pusherClient) {
              const channel = pusherClient.subscribe(
                getPaymentChannel(bookingNumber)
              );
              channelRef.current = channel;

              channel.bind(CHANNEL_PAYMENT_CONFIRM, (data: any) => {
                console.log("Received payment status update:", data);

                if (data.status === "confirmed") {
                  setPaymentStatus("success");

                  // Dừng đếm ngược
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                  }
                  if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                  }
                  setTimeout(() => {
                    setOpen(false);
                    onPaymentSuccess && onPaymentSuccess();
                  }, 2000);
                }
              });
            }
            // Bắt đầu polling kiểm tra trạng thái session
            pollingRef.current = setInterval(async () => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/session-status?sessionId=${bookingNumber}`);
                const statusData = await res.json();
                if (statusData.status === 'SUCCESS') {
                  setPaymentStatus('success');
                  if (timerRef.current) clearInterval(timerRef.current);
                  if (pollingRef.current) clearInterval(pollingRef.current);
                  setTimeout(() => {
                    setOpen(false);
                    onPaymentSuccess && onPaymentSuccess();
                  }, 2000);
                }
              } catch (e) {}
            }, 4000);
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
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          // Hủy đăng ký kênh Pusher
          if (channelRef.current && pusherClient) {
            pusherClient.unsubscribe(`payment-${bookingNumber}`);
            channelRef.current = null;
          }
        };
      } else {
        // Cleanup khi đóng popup
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }

        // Hủy đăng ký kênh Pusher
        if (channelRef.current && pusherClient && paymentSessionId) {
          pusherClient.unsubscribe(`payment-${paymentSessionId}`);
          channelRef.current = null;
        }
      }
    },
    [onPaymentSuccess, paymentSessionId, toast, items, router]
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
                  {sessionUrl ? (
                    <QrCodePayment
                      className="w-[250px] h-[250px]"
                      sessionId={paymentSessionId}
                      sessionUrl={sessionUrl}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-[250px] h-[250px]">
                      <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-2" />
                    </div>
                  )}
                </div>

                {/* Số tiền và hướng dẫn */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    Số tiền: {calculateCartTotal(items).toLocaleString()} ₫
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
