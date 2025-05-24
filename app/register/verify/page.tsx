"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token xác nhận không hợp lệ");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      // Simulate API call to verify token
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate verification (80% success rate)
      const success = Math.random() > 0.2;

      if (success) {
        setStatus("success");
        setMessage("Email đã được xác nhận thành công!");
      } else {
        setStatus("error");
        setMessage("Token đã hết hạn hoặc không hợp lệ");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Có lỗi xảy ra khi xác nhận email");
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleResendEmail = () => {
    router.push("/register/confirm");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xác nhận email...
              </h1>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Xác nhận thành công!
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6">
                Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập và bắt
                đầu sử dụng dịch vụ.
              </p>
              <Button onClick={handleGoToLogin} className="w-full">
                Đăng nhập ngay
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Xác nhận thất bại
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Gửi lại email xác nhận
                </Button>
                <Button onClick={handleGoToLogin} className="w-full">
                  Về trang đăng nhập
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
