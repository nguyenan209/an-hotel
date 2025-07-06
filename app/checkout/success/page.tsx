"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Home, Calendar, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Process booking information and payment status
    const processBookingInfo = async () => {
      if (typeof window !== "undefined") {
        const lastBooking = localStorage.getItem("lastBooking");
        const paymentSuccessful = sessionStorage.getItem("paymentSuccessful");

        // If we have items in cart but no successful payment flag, redirect to cart
        if (items.length > 0 && !paymentSuccessful && !lastBooking) {
          router.push("/cart");
          return;
        }

        // Process booking information
        if (lastBooking) {
          try {
            const bookingData = JSON.parse(lastBooking);
            setBookingInfo(bookingData);
          } catch (e) {
            console.error("Error parsing booking info:", e);
          }
        }

        // Clear the payment successful flag
        if (paymentSuccessful) {
          sessionStorage.removeItem("paymentSuccessful");
          // Make sure cart is cleared
          clearCart();
        }

        // Add a small delay to show loading state and ensure smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1500); // 1.5 seconds loading
      }
    };

    processBookingInfo();
  }, [items, router, clearCart]);

  if (!mounted) {
    return null;
  }

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">
            Đang xử lý đặt phòng...
          </h1>
          <p className="text-muted-foreground">
            Vui lòng chờ trong giây lát, chúng tôi đang hoàn tất đặt phòng của
            bạn.
          </p>
        </div>
      </div>
    );
  }

  // Show success content
  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Đặt phòng thành công!</h1>

        {bookingInfo && bookingInfo.confirmationCode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-lg font-medium text-green-800">
              Mã đặt phòng:{" "}
              <span className="font-bold">{bookingInfo.confirmationCode}</span>
            </p>
          </div>
        )}

        <p className="text-muted-foreground mb-8">
          Cảm ơn bạn đã đặt phòng tại Homestay của chúng tôi. Thông tin đặt
          phòng đã được gửi đến email của bạn.
        </p>

        <div className="flex flex-col gap-1">
          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Quay lại trang chủ
            </Button>
          </Link>

          <Link href="/bookings">
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Xem đặt phòng của tôi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
