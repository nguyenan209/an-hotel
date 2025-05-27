"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { randomBankInfo } from "@/lib/fake-info";

export default function PaymentPage() {
  const router = useRouter();
  const { sessionId } = useParams();
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [transferContent, setTransferContent] = useState("");
  const transactionId = searchParams.get("transactionId") || "";
  

  // Hàm fetch thông tin session
  const fetchPaymentSession = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/session/${sessionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch payment session");
      }
      const data = await response.json();
      setPaymentSession(data);
    } catch (error) {
      console.error("Error fetching payment session:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchPaymentSession khi component mount
  useEffect(() => {
    fetchPaymentSession();
  }, [sessionId]);

  if (loading) return <p>Loading...</p>;


  // Nếu không tìm thấy session, chuyển hướng
  if (!paymentSession) {
    router.replace("/payment/not-found");
    return null;
  }

  const handleConfirm = async () => {
    if (!transferContent.trim()) {
      alert("Vui lòng nhập nội dung chuyển khoản!");
      return;
    }

    setIsConfirming(true);

    try {
      // Call the API to confirm payment
      const response = await fetch("/api/payment/checkout/bank-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountHolder: randomBankInfo().accountHolder,
          bank: randomBankInfo().bank,
          accountNumber: randomBankInfo().accountNumber,
          transferContent,
          amount: paymentSession.payload.totalAmount,
          sessionId: paymentSession.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm payment");
      }

      setIsConfirmed(true);

      // Send notification (you can implement this)
      console.log("Payment confirmed - sending notification...");

      // Close this window after 3 seconds
      setTimeout(() => {
        window.close();
      }, 3000);
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Có lỗi xảy ra khi xác nhận thanh toán!");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Xác nhận thanh toán</CardTitle>
          <CardDescription>
            Vui lòng xác nhận thanh toán của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount Display - Large and prominent */}
          <div className="text-center py-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">
              Số tiền thanh toán
            </p>
            <p className="text-3xl font-bold text-primary">
              {Number.parseInt(paymentSession?.payload?.totalAmount).toLocaleString("vi-VN")} đ
            </p>
          </div>

          {!isConfirmed ? (
            <>
              {/* Transfer Information Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    value={process.env.NEXT_PUBLIC_OWNER_NAME || "AN-HOMESTAY"}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={`${process.env.NEXT_PUBLIC_OWNER_BANK_ACCOUNT} - ${process.env.NEXT_PUBLIC_OWNER_BANK}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="transferContent"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nội dung chuyển khoản *
                  </label>
                  <input
                    type="text"
                    id="transferContent"
                    value={transferContent}
                    onChange={(e) => setTransferContent(e.target.value)}
                    placeholder="Nhập nội dung chuyển khoản"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {transactionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã giao dịch
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">
                Thanh toán đã được xác nhận!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Notification đã được gửi. Cửa sổ này sẽ tự động đóng sau vài
                giây...
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={isConfirming || isConfirmed || !transferContent.trim()}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác nhận...
              </>
            ) : isConfirmed ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Đã xác nhận
              </>
            ) : (
              "Xác nhận thanh toán"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
