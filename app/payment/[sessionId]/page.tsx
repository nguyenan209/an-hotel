"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const { sessionId } = useParams();
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hàm fetch thông tin session
  const fetchPaymentSession = async () => {
    try {
      const response = await fetch(`/api/payment/session/${sessionId}`);
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

  if (!paymentSession) return <p>Payment session not found</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold text-center mb-4">
          Xác nhận Thanh Toán
        </h1>
        <p className="text-lg font-semibold text-gray-800">
          Số tiền: {paymentSession.amount.toLocaleString()} ₫
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Trạng thái:{" "}
          <span className="font-medium">{paymentSession.status}</span>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Vui lòng hoàn tất thanh toán để xác nhận đơn hàng.
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={fetchPaymentSession}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
