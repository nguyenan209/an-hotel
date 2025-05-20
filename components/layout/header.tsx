"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce(
    (acc: any, item: any) => acc + (item.quantity || 0),
    0
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useAuth();
  console.log("User in Header:", user);
  const router = useRouter();



  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
    
    if (!token) {
      router.push("/login");
    }
  }, []);
  
  if (!user && !isLoggedIn) {
    return "Loading...";
  }

  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            HomeStay
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link
              href="/"
              className={`text-sm font-medium ${
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium ${
                pathname === "/search"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tìm kiếm
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium ${
                pathname === "/contact"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Liên hệ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {isLoggedIn ? (
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="outline">Đăng nhập</Button>
              </Link>
              <Link href="/register" className="hidden md:block">
                <Button>Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
