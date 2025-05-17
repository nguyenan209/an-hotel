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
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Homestays",
      icon: Hotel,
      href: "/admin/homestays",
      active: pathname === "/admin/homestays" || pathname.startsWith("/admin/homestays/"),
    },
    {
      label: "Homestay Approvals",
      icon: CheckCircle,
      href: "/admin/approvals",
      active: pathname === "/admin/approvals" || pathname.startsWith("/admin/approvals/"),
    },
    {
      label: "Homestay Owners",
      icon: UserCog,
      href: "/admin/owners",
      active: pathname === "/admin/owners" || pathname.startsWith("/admin/owners/"),
    },
    {
      label: "Rooms",
      icon: Home,
      href: "/admin/rooms",
      active: pathname === "/admin/rooms" || pathname.startsWith("/admin/rooms/"),
    },
    {
      label: "Customers",
      icon: Users,
      href: "/admin/customers",
      active: pathname === "/admin/customers" || pathname.startsWith("/admin/customers/"),
    },
    {
      label: "Bookings",
      icon: ShoppingCart,
      href: "/admin/bookings",
      active: pathname === "/admin/bookings" || pathname.startsWith("/admin/bookings/"),
    },
    {
      label: "Reviews",
      icon: Star,
      href: "/admin/reviews",
      active: pathname === "/admin/reviews" || pathname.startsWith("/admin/reviews/"),
    },
    {
      label: "Complaints",
      icon: AlertCircle,
      href: "/admin/complaints",
      active: pathname === "/admin/complaints" || pathname.startsWith("/admin/complaints/"),
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/admin/reports",
      active: pathname === "/admin/reports" || pathname.startsWith("/admin/reports/"),
      subItems: [
        {
          label: "Revenue",
          href: "/admin/reports/revenue",
          active: pathname === "/admin/reports/revenue",
        },
        {
          label: "Booking Stats",
          href: "/admin/reports/bookings",
          active: pathname === "/admin/reports/bookings",
        },
        {
          label: "Room Usage",
          href: "/admin/reports/room-usage",
          active: pathname === "/admin/reports/room-usage",
        },
        {
          label: "Customer Demographics",
          href: "/admin/reports/demographics",
          active: pathname === "/admin/reports/demographics",
        },
        {
          label: "Reviews Analysis",
          href: "/admin/reports/reviews",
          active: pathname === "/admin/reports/reviews",
        },
      ],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname === "/admin/settings",
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
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
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
            {routes.map((route, i) => (
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
        <div className="mt-auto p-4">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/login">
                  <Button variant="outline" className="w-full justify-center px-0">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Log out</TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/admin/login">
              <Button variant="outline" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
