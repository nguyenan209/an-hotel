"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Nếu đã đăng nhập, chuyển hướng đến trang chủ
      router.push("/");
    }
  }, [user, router]);
  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto">
        <AuthForm type="register" />
      </div>
    </div>
  );
}
