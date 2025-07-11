"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Home,
  Hotel,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Star,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  className?: string
}

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed"

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  // Initialize with null to prevent hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null)

  // Load the collapsed state from localStorage on component mount
  useEffect(() => {
    const storedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    setIsCollapsed(storedState === "true")
  }, [])

  // Handle toggle with persistence
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState))
  }

  useEffect(() => {
    if (isCollapsed === null) return

    // Update the padding of the main content container based on sidebar state
    const mainContent = document.querySelector(".admin-main-content")
    if (mainContent) {
      if (isCollapsed) {
        mainContent.classList.remove("lg:pl-64")
        mainContent.classList.add("lg:pl-16")
      } else {
        mainContent.classList.remove("lg:pl-16")
        mainContent.classList.add("lg:pl-64")
      }
    }
  }, [isCollapsed])

  // Only render meaningful content after hydration
  if (isCollapsed === null) {
    return <div className={cn("flex h-full flex-col border-r bg-gray-100/40", className)} />
  }

  const routes = [
    {
      label: "Bảng điều khiển",
      icon: LayoutDashboard,
      href: pathname.startsWith("/owner") ? "/owner" : "/admin",
      active: pathname === "/owner" || pathname === "/admin",
    },
    {
      label: "Homestay",
      icon: Hotel,
      href: pathname.startsWith("/owner") ? "/owner/homestays" : "/admin/homestays",
      active: pathname === "/admin/homestays" || pathname.startsWith("/admin/homestays/"),
    },
    {
      label: "Phê duyệt Homestay",
      icon: CheckCircle,
      href: "/admin/approvals",
      active: pathname === "/admin/approvals" || pathname.startsWith("/admin/approvals/"),
      hidden: pathname.startsWith("/owner")
    },
    {
      label: "Chủ Homestay",
      icon: UserCog,
      href: "/admin/owners",
      active: pathname === "/admin/owners" || pathname.startsWith("/admin/owners/"),
      hidden: pathname.startsWith("/owner")
    },
    {
      label: "Phòng",
      icon: Home,
      href: pathname.startsWith("/owner") ? "/owner/rooms" : "/admin/rooms",
      active: pathname === "/admin/rooms" || pathname.startsWith("/admin/rooms/") || pathname.startsWith("/owner/rooms/"),
    },
    {
      label: "Khách hàng",
      icon: Users,
      href: pathname.startsWith("/owner") ? "/owner/customers" : "/admin/customers",
      active: pathname === "/admin/customers" || pathname.startsWith("/admin/customers/") || pathname.startsWith("/owner/customers/"),
    },
    {
      label: "Đặt phòng",
      icon: ShoppingCart,
      href: pathname.startsWith("/owner") ? "/owner/bookings" : "/admin/bookings",
      active: pathname === "/admin/bookings" || pathname.startsWith("/admin/bookings/") || pathname.startsWith("/owner/bookings/"),
    },
    {
      label: "Thanh toán",
      icon: CreditCard,
      href: pathname.startsWith("/owner") ? "/owner/payments" : "/admin/payments",
      active: pathname === "/admin/payments" || pathname.startsWith("/admin/payments/") || pathname.startsWith("/owner/payments/"),
    },
    {
      label: "Đánh giá",
      icon: Star,
      href: pathname.startsWith("/owner") ? "/owner/reviews" : "/admin/reviews",
      active: pathname === "/admin/reviews" || pathname.startsWith("/admin/reviews/") || pathname.startsWith("/owner/reviews/"),
    },
    {
      label: "Khiếu nại",
      icon: AlertCircle,
      href: pathname.startsWith("/owner") ? "/owner/complaints" : "/admin/complaints",
      active: pathname === "/admin/complaints" || pathname.startsWith("/admin/complaints/") || pathname.startsWith("/owner/complaints/"),
    },
    {
      label: "Báo cáo",
      icon: BarChart3,
      href: pathname.startsWith("/owner") ? "/owner/reports" : "/admin/reports",
      active: pathname === "/admin/reports" || pathname.startsWith("/admin/reports/") || pathname.startsWith("/owner/reports/"),
      subItems: [
        {
          label: "Doanh thu",
          href: pathname.startsWith("/owner") ? "/owner/reports/revenue" : "/admin/reports/revenue",
          active: pathname === "/admin/reports/revenue" || pathname.startsWith("/owner/reports/revenue/"),
        },
        {
          label: "Thống kê đặt phòng",
          href: pathname.startsWith("/owner") ? "/owner/reports/bookings" : "/admin/reports/bookings",
          active: pathname === "/admin/reports/bookings" || pathname.startsWith("/owner/reports/bookings/"),
        },
        {
          label: "Sử dụng phòng",
          href: pathname.startsWith("/owner") ? "/owner/reports/room-usage" : "/admin/reports/room-usage",
          active: pathname === "/admin/reports/room-usage" || pathname.startsWith("/owner/reports/room-usage/"),
        },
        {
          label: "Nhân khẩu học khách hàng",
          href: pathname.startsWith("/owner") ? "/owner/reports/demographics" : "/admin/reports/demographics",
          active: pathname === "/admin/reports/demographics" || pathname.startsWith("/owner/reports/demographics/"),
        },
        {
          label: "Phân tích đánh giá",
          href: pathname.startsWith("/owner") ? "/owner/reports/reviews" : "/admin/reports/reviews",
          active: pathname === "/admin/reports/reviews" || pathname.startsWith("/owner/reports/reviews/"),
        },
      ],
    },
    {
      label: "Cài đặt",
      icon: Settings,
      href: pathname === "/owner" ? "/owner/settings" : "/admin/settings",
      active: pathname === "/admin/settings",
      hidden: pathname.startsWith("/owner")
    },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex h-full flex-col border-r bg-gray-100/40 transition-all duration-300 fixed inset-y-0 left-0 z-50",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          {!isCollapsed && (
            <Link href={pathname.startsWith("/owner") ? "/owner" : "/admin"} className="flex items-center gap-2 font-semibold">
              <Hotel className="h-6 w-6" />
              <span className="font-bold text-xl">HomeStay</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="mx-auto">
              <Hotel className="h-6 w-6" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", isCollapsed && "mx-auto")}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {routes.filter(route => !route.hidden).map((route, i) => (
              <div key={i}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                          route.active ? "bg-gray-100 text-gray-900" : "text-gray-500",
                          isCollapsed && "justify-center px-0",
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{route.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                      route.active ? "bg-gray-100 text-gray-900" : "text-gray-500",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    <span>{route.label}</span>
                  </Link>
                )}

                {!isCollapsed && route.subItems && route.subItems.length > 0 && (
                  <div className="ml-4 mt-1 grid gap-1">
                    {route.subItems.map((subItem, j) => (
                      <Link
                        key={j}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                          subItem.active ? "bg-gray-100 text-gray-900" : "text-gray-500",
                        )}
                      >
                        <div className="h-1 w-1 rounded-full bg-current" />
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}
