"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, HelpCircle, BookOpen, LogOut, MessageCircle, UserCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { formatCurrency } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export function HeroHeader() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const totalHomestays = cartItems.length;
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const router = useRouter();

  const { scrollY } = useScroll();
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(229, 231, 235, 1)"]
  );
  const textColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 1)", "rgba(0, 0, 0, 1)"]
  );

  useEffect(() => {      
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
    return unsubscribe;
  }, [scrollY]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: headerBackground,
        borderBottomColor: headerBorder,
        borderBottomWidth: 1,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            <motion.span style={{ color: textColor }}>
              <Image
                src={isScrolled ? "/images/black-logo.png" : "/images/white-logo.png"}
                alt="An's Homestay"
                height={56}
                width={56}
                className="h-14 w-auto transition-all duration-300"
                priority
              />
            </motion.span>
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors ${
                pathname === "/search" ? "text-primary" : ""
              }`}
            >
              <motion.span
                style={{
                  color: pathname === "/search" ? undefined : textColor,
                }}
                className={
                  pathname === "/search" ? "text-primary" : "hover:text-primary"
                }
              >
                Tìm kiếm
              </motion.span>
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                pathname === "/contact" ? "text-primary" : ""
              }`}
            >
              <motion.span
                style={{
                  color: pathname === "/contact" ? undefined : textColor,
                }}
                className={
                  pathname === "/contact"
                    ? "text-primary"
                    : "hover:text-primary"
                }
              >
                Liên hệ
              </motion.span>
            </Link>
            <Link
              href="/support"
              className={`text-sm font-medium transition-colors ${
                pathname === "/support" ? "text-primary" : ""
              }`}
            >
              <motion.span
                style={{
                  color: pathname === "/support" ? undefined : textColor,
                }}
                className={
                  pathname === "/support"
                    ? "text-primary"
                    : "hover:text-primary"
                }
              >
                Hỗ trợ
              </motion.span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <Link href="/host/register" className="hidden md:block">
              <Button
                variant="outline"
                className={`transition-all ${
                  isScrolled
                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    : "bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                Trở thành host
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`relative transition-all ${
                  isScrolled
                    ? "border border-gray-200 bg-white hover:bg-gray-50"
                    : "border border-white/30 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                <ShoppingCart
                  className={`h-5 w-5 ${
                    isScrolled ? "text-gray-700" : "text-white"
                  }`}
                />
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
              <HelpCircle
                className={`h-5 w-5 ${
                  isScrolled ? "text-gray-700" : "text-white"
                }`}
              />
            </Button>
          </Link>
          {isLoggedIn ? (
            <>
              <NotificationDropdown variant="user" isScrolled={isScrolled} />
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
                      <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
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
    </motion.header>
  );
}
