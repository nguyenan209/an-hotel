"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function RegisterConfirmPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const userName = searchParams.get("name") || "";

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    setIsVerifying(true);

    try {
      // Gọi API xác minh OTP
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Mã OTP không chính xác hoặc đã hết hạn");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return; // Thêm return để dừng thực thi tiếp
      }

      toast.success("Xác nhận thành công!");
      router.push("/login?verified=true");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);

    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Mã OTP mới đã được gửi!");
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error("Không thể gửi lại mã OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when all fields are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && !isVerifying) {
      handleVerifyOTP();
    }
  }, [otp]);

  if (!email) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy thông tin đăng ký
              </p>
              <Button asChild>
                <Link href="/register">Quay lại đăng ký</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Xác nhận email</CardTitle>
            <CardDescription>
              Chúng tôi đã gửi mã OTP 6 số đến
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp">Nhập mã OTP</Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-bold"
                    disabled={isVerifying || timeLeft === 0}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {timeLeft > 0 ? (
                  <>Mã sẽ hết hạn sau {formatTime(timeLeft)}</>
                ) : (
                  <span className="text-red-600 font-medium">
                    Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
                  </span>
                )}
              </span>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.some((digit) => digit === "")}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang xác nhận...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>

            {/* Resend Button */}
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi lại mã OTP"
              )}
            </Button>

            {/* Help Text */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Kiểm tra cả thư mục spam/junk mail</p>
              <p>• Mã OTP có hiệu lực trong 5 phút</p>
              <p>• Nhập đầy đủ 6 số để tự động xác nhận</p>
            </div>

            {/* Support Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Cần hỗ trợ? </span>
              <Link
                href="/contact"
                className="font-medium text-primary hover:underline"
              >
                Liên hệ với chúng tôi
              </Link>
            </div>

            {/* Back to Register */}
            <div className="text-center">
              <Button variant="ghost" asChild>
                <Link href="/register">← Quay lại đăng ký</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
