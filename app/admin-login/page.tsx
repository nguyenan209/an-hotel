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
  Shield,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username là bắt buộc";
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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (formData.username === "admin" && formData.password === "admin123") {
        localStorage.setItem(
          "adminAuth",
          JSON.stringify({ username: formData.username, role: "admin" })
        );
        router.push("/admin");
      } else {
        setErrors({ submit: "Username hoặc mật khẩu không đúng" });
      }
    } catch (error) {
      setErrors({ submit: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Image - Lakeside Villa có bầu trời rộng bên phải */}
      <div className="absolute inset-0">
        <Image
          src="/images/admin-login.jpg"
          alt="Lakeside landscape"
          fill
          className="object-cover"
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

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-between px-8 lg:px-16">
        {/* Left Side - Welcome Content */}
        <div className="flex-1 max-w-lg text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">HomeStay Admin</h1>
            </div>
          </div>

          <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Admin
            <br />
            Portal
          </h2>

          <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-md">
            Quản lý toàn bộ hệ thống HomeStay với quyền hạn cao nhất. Theo dõi
            người dùng, phê duyệt homestay và phân tích dữ liệu một cách toàn
            diện.
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

        {/* Right Side - Login Form với size nhỏ hơn */}
        <div className="flex-1 max-w-sm ml-8">
          {/* Thêm backdrop tối cho khu vực form */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-white mb-6">
              <h3 className="text-2xl font-bold mb-2">Admin Sign in</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/90 text-sm">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="admin"
                  className={`h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-pink-400 ${
                    errors.username ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {errors.username && (
                  <p className="text-red-300 text-sm">{errors.username}</p>
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
                  Chỉ dành cho quản trị viên hệ thống{" "}
                  <Link
                    href="/terms"
                    className="text-pink-200 underline hover:text-pink-100"
                  >
                    Terms of Service
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
