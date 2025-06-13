"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "@/components/auth/auth-form";
import { Token } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    // Chỉ login nếu chưa đăng nhập
    if (token && !isLoggedIn) {
      const user = jwtDecode<Token>(token);
      login(user, token);
      router.replace("/");
    }
    // Nếu đã đăng nhập, tự động về trang chủ (tránh lặp)
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [searchParams, login, router, isLoggedIn]);

  return <AuthForm type="login" />;
}
