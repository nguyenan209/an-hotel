"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
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
        <AuthForm type="login" />
      </div>
    </div>
  );
}
