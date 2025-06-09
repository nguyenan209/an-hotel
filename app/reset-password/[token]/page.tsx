"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      // In a real app, you would verify the token with your API
      // For demo, we'll simulate a token check
      setTimeout(() => {
        if (params.token && params.token.length > 10) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError("Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn");
        }
      }, 1000);
    };

    validateToken();
  }, [params.token]);

  // Check password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would call your API to reset the password
      // For demo, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-pink-500/20 to-pink-700/30">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/images/sunset-beach-villa-1.png')",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navigation */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="text-white hover:text-pink-200 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="text-white hover:text-pink-200 transition-colors flex items-center gap-2"
        >
          <Home className="h-5 w-5" />
          <span>Trang chủ</span>
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full px-4">
        {/* Left column - Info content */}
        <div className="hidden md:flex flex-col text-white max-w-md px-8 mb-10 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">Đặt lại mật khẩu</h1>
          <p className="text-lg mb-6 text-white/90">
            Tạo mật khẩu mới cho tài khoản HomeStay của bạn. Mật khẩu mới phải
            khác với mật khẩu đã sử dụng trước đây.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full mt-0.5">
                <Lock className="h-4 w-4 text-pink-200" />
              </div>
              <div>
                <h3 className="font-medium">Mật khẩu mạnh</h3>
                <p className="text-sm text-white/80">
                  Sử dụng ít nhất 8 ký tự với chữ hoa, chữ thường, số và ký tự
                  đặc biệt
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full mt-0.5">
                <CheckCircle className="h-4 w-4 text-pink-200" />
              </div>
              <div>
                <h3 className="font-medium">Xác nhận mật khẩu</h3>
                <p className="text-sm text-white/80">
                  Nhập lại mật khẩu mới để đảm bảo không có lỗi đánh máy
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold mb-2">💡 Mẹo bảo mật</h3>
            <ul className="text-sm space-y-1 text-white/80">
              <li>• Không sử dụng thông tin cá nhân trong mật khẩu</li>
              <li>• Không sử dụng mật khẩu đã dùng cho các tài khoản khác</li>
              <li>• Cân nhắc sử dụng trình quản lý mật khẩu</li>
            </ul>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
          {tokenValid === null ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white">Đang xác thực link khôi phục...</p>
            </div>
          ) : tokenValid === false ? (
            <div className="text-center py-8">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Link không hợp lệ
              </h2>
              <p className="text-white/80 mb-6">{error}</p>
              <Button
                onClick={() => (window.location.href = "/forgot-password")}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
              >
                Yêu cầu link mới
              </Button>
            </div>
          ) : success ? (
            <div className="text-center py-6">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Đặt lại mật khẩu thành công!
              </h2>
              <p className="text-white/80 mb-6">
                Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển đến trang
                đăng nhập trong vài giây.
              </p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
                <div className="bg-pink-500 h-1.5 rounded-full animate-[grow_3s_ease-in-out]"></div>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="bg-pink-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-pink-200" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Đặt lại mật khẩu
                </h1>
                <p className="text-white/80 text-sm">
                  Tạo mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 text-white p-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white"
                  >
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/80 border-white/20 focus:border-pink-500 focus:ring-pink-500"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/80">Độ mạnh mật khẩu:</span>
                        <span
                          className={
                            passwordStrength === 0
                              ? "text-red-400"
                              : passwordStrength === 1
                              ? "text-orange-400"
                              : passwordStrength === 2
                              ? "text-yellow-400"
                              : passwordStrength === 3
                              ? "text-green-400"
                              : "text-green-300"
                          }
                        >
                          {passwordStrength === 0
                            ? "Rất yếu"
                            : passwordStrength === 1
                            ? "Yếu"
                            : passwordStrength === 2
                            ? "Trung bình"
                            : passwordStrength === 3
                            ? "Mạnh"
                            : "Rất mạnh"}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            passwordStrength === 0
                              ? "bg-red-500 w-1/5"
                              : passwordStrength === 1
                              ? "bg-orange-500 w-2/5"
                              : passwordStrength === 2
                              ? "bg-yellow-500 w-3/5"
                              : passwordStrength === 3
                              ? "bg-green-500 w-4/5"
                              : "bg-green-400 w-full"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-white"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 pr-10 bg-white/80 border-white/20 focus:border-pink-500 focus:ring-pink-500 ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-500"
                          : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      Mật khẩu xác nhận không khớp
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                  disabled={loading || password !== confirmPassword}
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
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
