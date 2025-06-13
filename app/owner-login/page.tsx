"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Home,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const result = await res.json();

      if (res.ok) {
        login(result.user, result.token);
        router.push("/owner");
      } else {
        setErrors({ submit: result.message || "Email hoặc mật khẩu không đúng" });
      }
    } catch (error) {
      setErrors({ submit: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Image - Lakeside Villa có bầu trời rộng bên phải */}
      <div className="absolute inset-0">
        <Image
          src="/images/lakeside-villa-1.png"
          alt="Lakeside landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/50"></div>
      </div>

      {/* Back to home link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Về trang chủ
      </Link>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-between px-8 lg:px-16">
        {/* Left Side - Welcome Content */}
        <div className="flex-1 max-w-lg text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">HomeStay</h1>
            </div>
          </div>

          <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Welcome
            <br />
            Back
          </h2>

          <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-md">
            Quản lý homestay của bạn một cách dễ dàng và hiệu quả. Theo dõi đặt
            phòng, khách hàng và doanh thu mọi lúc mọi nơi với hệ thống quản lý
            thông minh.
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Facebook className="h-5 w-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Twitter className="h-5 w-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Youtube className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form với background tối hơn */}
        <div className="flex-1 max-w-sm ml-8">
          {/* Thêm backdrop tối cho khu vực form */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-white mb-6">
              <h3 className="text-2xl font-bold mb-2">Sign in</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="owner@homestay.com"
                  className={`h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-pink-400 ${
                    errors.email ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-300 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="••••••••"
                    className={`h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 pr-10 focus:ring-2 focus:ring-pink-400 ${
                      errors.password ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-white/50 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white data-[state=checked]:border-pink-500"
                />
                <Label htmlFor="remember" className="text-white/90 text-sm">
                  Remember Me
                </Label>
              </div>

              {errors.submit && (
                <div className="bg-red-500/20 border border-red-300 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-red-200 text-sm">{errors.submit}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold border-0 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in now"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-pink-200 hover:text-pink-100 text-sm transition-colors"
                >
                  Lost your password?
                </Link>
              </div>

              <div className="text-center">
                <p className="text-white/70 text-xs leading-relaxed">
                  By clicking on "Sign in now" you agree to{" "}
                  <Link
                    href="/terms"
                    className="text-pink-200 underline hover:text-pink-100"
                  >
                    Terms of Service
                  </Link>{" "}
                  |{" "}
                  <Link
                    href="/privacy"
                    className="text-pink-200 underline hover:text-pink-100"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80 mb-3 text-sm">
                Chưa có tài khoản Host?
              </p>
              <Link href="/host/register">
                <Button
                  variant="outline"
                  className="w-full h-10 border-2 border-pink-300/50 text-pink-200 bg-transparent hover:bg-pink-500/20 hover:border-pink-300 font-semibold transition-all duration-200"
                >
                  Đăng ký trở thành Host
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
