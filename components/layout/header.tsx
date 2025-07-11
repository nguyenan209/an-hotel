"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  HelpCircle,
  LogOut,
  MessageCircle,
  ShoppingCart,
  User,
  UserCircle,
} from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const totalHomestays = cartItems.length;
  const totalItems = cartItems.reduce(
    (acc: any, item: any) => acc + (item.quantity || 0),
    0
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

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
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="An's Homestay"
              height={56}
              width={56}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex gap-4">
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
            <Link
              href="/support"
              className={`text-sm font-medium ${
                pathname === "/support"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hỗ trợ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <Link href="/host/register" className="hidden md:block">
              <Button
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Become host
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative border border-gray-200 bg-white hover:bg-gray-50"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalHomestays > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white text-[10px]">
                    {totalHomestays}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4">
                <h3 className="font-semibold mb-3">
                  Giỏ hàng ({totalHomestays})
                </h3>
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Giỏ hàng trống
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cartItems.slice(0, 3).map((item) => (
                      <div
                        key={item.homestayId}
                        className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                      >
                        <img
                          src={item.homestay.images?.[0] || "/placeholder.svg?height=48&width=48"}
                          alt={item.homestay.name || "Homestay"}
                          className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900">
                            {item.homestay.name || "Homestay"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.bookingType === 'ROOMS'
                              ? (item.rooms?.map((room) => room.roomName).join(', ') || 'Phòng')
                              : 'Toàn bộ homestay'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.nights} đêm
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-primary font-medium">
                            {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        và {cartItems.length - 3} homestay khác...
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t">
                  <Link href="/cart" className="w-full">
                    <Button className="w-full" size="sm">
                      Xem giỏ hàng ({totalHomestays} homestay)
                    </Button>
                  </Link>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/support" className="md:hidden">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
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
                        src={user?.avatar || "https://github.com/shadcn.png"}
                        alt="User avatar"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-fit p-0"
                  sideOffset={10}
                >
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/bookings"
                      className="w-full flex items-center gap-1 px-3 py-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Đặt phòng của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-1 px-3 py-2 cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      Hồ sơ của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/support/my-complaints"
                      className="w-full flex items-center gap-1 px-3 py-2 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      Khiếu nại của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    Đăng xuất
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
