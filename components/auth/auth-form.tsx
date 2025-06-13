"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Home, Lock, Mail } from "lucide-react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, loginSchema } from "@/lib/validation";
import { useAuth } from "@/context/AuthContext";

interface AuthFormProps {
  type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const schema = type === "login" ? loginSchema : registerSchema;
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(type === "register" ? { confirmPassword: "" } : {}),
    },
  });

  const handleGoHome = () => {
    router.push("/");
  };

  const onSubmit = async (data: FormValues) => {
    setError("");

    try {
      if (type === "login") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          setError(result.message || "Đăng nhập thất bại");
          return;
        }

        login(result.user, result.token);
        router.push("/");
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.email,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          setError(result.message || "Đăng ký thất bại");
          return;
        }
        router.push(`/register/confirm?email=${data.email}&token=${result.token}`);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };

  // Google login handler
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/google`;
  };

  return (
    <div className="fixed inset-0">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/images/login-page.png')",
          backgroundSize: "object-fit",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Home link */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          onClick={handleGoHome}
          variant="ghost"
          className="text-white hover:text-pink-200 hover:bg-white/10 transition-colors flex items-center gap-2 px-3 py-2"
        >
          <Home className="h-5 w-5" />
          <span>Trang chủ</span>
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full px-4">
        {/* Left column - Welcome content */}
        <div className="hidden md:flex flex-col text-white max-w-md px-8 mb-10 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">
            {type === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h1>
          <p className="text-lg mb-6 text-white/90">
            {type === "login"
              ? "Đăng nhập để trải nghiệm những kỳ nghỉ tuyệt vời tại các homestay độc đáo trên khắp Việt Nam."
              : "Đăng ký để bắt đầu hành trình khám phá những homestay độc đáo trên khắp Việt Nam."}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <span className="text-pink-200">✓</span>
              </div>
              <span>Đặt phòng nhanh chóng, thanh toán dễ dàng</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <span className="text-pink-200">✓</span>
              </div>
              <span>Lưu trữ homestay yêu thích</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <span className="text-pink-200">✓</span>
              </div>
              <span>Nhận ưu đãi đặc biệt dành riêng cho thành viên</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="#" className="text-white hover:text-pink-200 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </Link>
            <Link href="#" className="text-white hover:text-pink-200 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="text-center mb-6 md:hidden">
            <h1 className="text-2xl font-bold text-white">
              {type === "login" ? "Đăng nhập" : "Đăng ký"}
            </h1>
            <p className="text-white/80 text-sm">
              {type === "login"
                ? "Nhập thông tin đăng nhập của bạn"
                : "Tạo tài khoản mới để sử dụng dịch vụ"}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-white">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10 bg-white/80 border-white/20 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-white">Mật khẩu</FormLabel>
                      {type === "login" && (
                        <Link href="/forgot-password" className="text-xs text-pink-300 hover:text-pink-200">
                          Quên mật khẩu?
                        </Link>
                      )}
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white/80 border-white/20 focus:border-pink-500 focus:ring-pink-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink-300" />
                  </FormItem>
                )}
              />

              {type === "register" && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-white">Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-white/80 border-white/20 focus:border-pink-500 focus:ring-pink-500"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-pink-300" />
                    </FormItem>
                  )}
                />
              )}

              {type === "login" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    className="border-white data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                  />
                  <label htmlFor="remember" className="text-sm text-white">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
              )}

              {error && <p className="text-sm text-pink-300">{error}</p>}

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
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
                ) : type === "login" ? (
                  "Đăng nhập"
                ) : (
                  "Đăng ký"
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 text-white bg-black/30 backdrop-blur-sm rounded">
                    HOẶC TIẾP TỤC VỚI
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/80 hover:bg-white text-gray-800 border-white/20 flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {type === "login" ? "Đăng nhập với Google" : "Đăng ký với Google"}
              </Button>

              <div className="text-center text-sm text-white mt-4">
                {type === "login" ? (
                  <>
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="text-pink-300 hover:text-pink-200 font-medium">
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-pink-300 hover:text-pink-200 font-medium">
                      Đăng nhập
                    </Link>
                  </>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
