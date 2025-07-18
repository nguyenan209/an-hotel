"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Gửi email thất bại");
      }
      setSent(true);
      toast.success("Đã gửi email khôi phục mật khẩu!");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Gửi lại email thất bại");
      }
      toast.success("Đã gửi lại email khôi phục!");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-pink-500/20 to-pink-700/30">
      {/* Background Image - Lakeside Villa có bầu trời rộng bên phải */}
      <div className="absolute inset-0">
        <Image
          src="/images/forgotpassword.jpg"
          alt="Lakeside landscape"
          fill
          className="object-cover object-[center_30%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/50"></div>
      </div>

      {/* Navigation */}
      <div className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-white hover:text-pink-200 hover:bg-white/10 transition-colors flex items-center gap-2 px-3 py-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleGoHome}
          className="text-white hover:text-pink-200 hover:bg-white/10 transition-colors flex items-center gap-2 px-3 py-2"
        >
          <Home className="h-5 w-5" />
          <span>Trang chủ</span>
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-start w-full h-full px-[100px]">
        {/* Left column - Info content */}
        <div className="hidden md:flex flex-col text-white max-w-md px-8 mb-10 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">Khôi phục mật khẩu</h1>
          <p className="text-lg mb-6 text-white/90">
            Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài
            khoản HomeStay của mình.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <span className="text-pink-200">1</span>
              </div>
              <span>Nhập địa chỉ email của bạn</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <span className="text-pink-200">2</span>
              </div>
              <span>Kiểm tra email để nhận link khôi phục</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <span className="text-pink-200">3</span>
              </div>
              <span>Tạo mật khẩu mới và đăng nhập</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold mb-2">💡 Mẹo bảo mật</h3>
            <ul className="text-sm space-y-1 text-white/80">
              <li>• Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
              <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
            </ul>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="bg-pink-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-pink-200" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Quên mật khẩu?
                </h1>
                <p className="text-white/80 text-sm">
                  Nhập email của bạn và chúng tôi sẽ gửi link khôi phục mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white"
                  >
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/80 border-white/20 focus:border-pink-500 focus:ring-pink-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi link khôi phục"
                  )}
                </Button>

                <div className="text-center text-sm text-white mt-4">
                  <Link
                    href="/login"
                    className="text-pink-300 hover:text-pink-200 font-medium"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-300" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Email đã được gửi!
                </h1>
                <p className="text-white/80 text-sm">
                  Chúng tôi đã gửi link khôi phục mật khẩu đến
                </p>
                <p className="text-pink-300 font-medium mt-1">{email}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-2">
                    📧 Kiểm tra email của bạn
                  </h3>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Kiểm tra hộp thư đến</li>
                    <li>• Kiểm tra thư mục spam/junk</li>
                    <li>• Link có hiệu lực trong 15 phút</li>
                  </ul>
                </div>

                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang gửi lại...
                    </>
                  ) : (
                    "Gửi lại email"
                  )}
                </Button>

                <div className="text-center text-sm text-white">
                  <Link
                    href="/login"
                    className="text-pink-300 hover:text-pink-200 font-medium"
                  >
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
