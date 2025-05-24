"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import { BookingSummary } from "@/components/checkout/booking-summary";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCartStore } from "@/lib/store/cartStore";
import { QRPaymentStatus } from "@/lib/types";
import { BookingStatus, PaymentMethod } from "@prisma/client";
import { useUser } from "@/hooks/use-user";

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const token = Cookies.get("token") || null;
  const { user, loading } = useUser(token);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.BANK_TRANSFER
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrPaymentStatus, setQrPaymentStatus] = useState<QRPaymentStatus>(
    QRPaymentStatus.PENDING
  );
  const [creditCardPaymentDetails, setCreditCardPaymentDetails] =
    useState<any>(null);
  const { items, getTotalPrice, clearCart, notes } = useCartStore();

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Redirect to cart if no items
  if (items.length === 0) {
    if (typeof window !== "undefined") {
      router.push("/cart");
    }
    return null;
  }

  const totalPrice = getTotalPrice();

  // Xử lý khi thanh toán thẻ thành công
  const handleCreditCardSuccess = (paymentDetails: any) => {
    setCreditCardPaymentDetails(paymentDetails);
    // Hoàn thành đặt phòng với phương thức thanh toán thẻ
    handleCompleteBooking(PaymentMethod.CREDIT_CARD, paymentDetails);
  };

  // Xử lý khi thanh toán QR thành công
  const handleQRSuccess = () => {
    setQrPaymentStatus(QRPaymentStatus.CONFIRMED);
    toast({
      title: "Thanh toán QR thành công",
      description:
        "Thanh toán của bạn đã được xác nhận. Đang xử lý đặt phòng...",
      variant: "default",
    });
    handleCompleteBooking(PaymentMethod.BANK_TRANSFER, {
      qrStatus: QRPaymentStatus.CONFIRMED,
    });
  };

  // Xử lý hoàn thành đặt phòng - Call API
  const handleCompleteBooking = async (
    method: PaymentMethod = paymentMethod,
    paymentDetails: any = null
  ) => {
    setIsProcessing(true);

    try {
      // Tạo dữ liệu đặt phòng để gửi đến API
      const bookingData = {
        paymentMethod: method,
        totalAmount: totalPrice,
        currency: "VND",
        items: items.map((item) => ({
          homestayId: item.homestayId,
          homestayName: item.homestay?.name || "Unknown Homestay", // Đảm bảo có giá trị mặc định
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          guests: item.guests,
          nights: item.nights,
          bookingType: item.bookingType,
          rooms:
            item.rooms?.map((room) => ({
              roomId: room.roomId,
              roomName: room.roomName || "Unknown Room", // Đảm bảo có giá trị mặc định
              pricePerNight: room.price || 0, // Đặt giá trị mặc định nếu không có giá
            })) || [],
          totalPrice: item.rooms
            ? item.rooms.reduce(
                (total, room) => total + room.price * item.nights,
                0
              )
            : item.homestay.price * item.nights,
        })),
        customer: {
          userId: user?.id || null, // Lấy ID người dùng từ hook useUser
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          address: user?.address,
        },
        specialRequests: notes,
        status: BookingStatus.PENDING,
      };

      // Gọi API checkout-payment
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: method,
          bookingData,
          paymentDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process booking");
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Booking failed");
      }

      console.log("API response:", apiResponse);

      // Lưu thông tin đặt phòng vào localStorage để hiển thị ở trang thành công
      if (typeof window !== "undefined") {
        localStorage.setItem("lastBooking", JSON.stringify(apiResponse.data));
      }

      // Show success toast with more details based on payment method
      let successMessage = "";
      switch (method) {
        case PaymentMethod.BANK_TRANSFER:
          successMessage = `Thanh toán QR thành công! Mã đặt phòng của bạn là ${apiResponse.data.confirmationCode}.`;
          break;
        case PaymentMethod.CREDIT_CARD:
          successMessage = `Thanh toán thẻ thành công! Mã đặt phòng của bạn là ${apiResponse.data.confirmationCode}.`;
          break;
        case PaymentMethod.CASH:
          successMessage = `Đặt phòng thành công! Mã đặt phòng của bạn là ${apiResponse.data.confirmationCode}. Vui lòng thanh toán tại lễ tân khi nhận phòng.`;
          break;
      }

      toast({
        title: "Đặt phòng thành công!",
        description: successMessage,
        variant: "default",
      });

      // First redirect to success page, then clear cart
      window.location.href = "/checkout/success";

      // Clear cart after redirect is initiated
      clearCart();
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Lỗi đặt phòng",
        description:
          error.message ||
          "Đã xảy ra lỗi khi xử lý đặt phòng. Vui lòng thử lại sau.",
        variant: "destructive",
      });

      // Reset QR payment status if failed
      if (method === PaymentMethod.BANK_TRANSFER) {
        setQrPaymentStatus(QRPaymentStatus.PENDING);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // Reset states when changing payment method
    if (method !== PaymentMethod.CREDIT_CARD) {
      setCreditCardPaymentDetails(null);
    }
    if (method !== PaymentMethod.BANK_TRANSFER) {
      setQrPaymentStatus(QRPaymentStatus.PENDING);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onPaymentMethodChange={handlePaymentMethodChange}
            totalPrice={totalPrice}
            onCreditCardSuccess={handleCreditCardSuccess}
            onQRSuccess={handleQRSuccess}
          />

          {(paymentMethod !== PaymentMethod.CREDIT_CARD ||
            qrPaymentStatus === "confirmed") && (
            <div className="flex justify-end">
              <Button
                onClick={() => handleCompleteBooking()}
                size="lg"
                disabled={isProcessing}
                className="w-full md:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Hoàn thành đặt phòng
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <BookingSummary items={items} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
