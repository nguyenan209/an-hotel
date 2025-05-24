"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, ShoppingCart, User, UserCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce(
    (acc: any, item: any) => acc + (item.quantity || 0),
    0
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  console.log("User in Header:", user);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();

    // Chuyển hướng người dùng đến trang đăng nhập
    router.push("/login");
  };

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
            <>
              <NotificationDropdown variant="user" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="User avatar"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-fit p-0" sideOffset={10}>
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/bookings"
                      className="w-full flex items-center gap-1 px-3 py-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-1 px-3 py-2 cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
