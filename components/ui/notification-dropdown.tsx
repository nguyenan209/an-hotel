"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "booking" | "review" | "payment" | "system";
}

interface NotificationDropdownProps {
  notifications?: Notification[];
  unreadCount?: number;
  variant?: "admin" | "user";
}

const defaultAdminNotifications: Notification[] = [
  {
    id: "1",
    title: "New booking",
    message: "Sunset Beach Villa",
    time: "5 minutes ago",
    read: false,
    type: "booking",
  },
  {
    id: "2",
    title: "New review",
    message: "Mountain Retreat",
    time: "1 hour ago",
    read: false,
    type: "review",
  },
  {
    id: "3",
    title: "Booking cancelled",
    message: "Riverside Cottage",
    time: "2 hours ago",
    read: true,
    type: "booking",
  },
];

const defaultUserNotifications: Notification[] = [
  {
    id: "1",
    title: "Booking confirmed",
    message: "Your booking at Sunset Beach Villa has been confirmed",
    time: "10 minutes ago",
    read: false,
    type: "booking",
  },
  {
    id: "2",
    title: "Payment successful",
    message: "Payment for Mountain Retreat completed",
    time: "1 hour ago",
    read: false,
    type: "payment",
  },
  {
    id: "3",
    title: "Review reminder",
    message: "Please review your stay at Riverside Cottage",
    time: "1 day ago",
    read: true,
    type: "review",
  },
];

export function NotificationDropdown({
  notifications,
  unreadCount,
  variant = "user",
}: NotificationDropdownProps) {
  const router = useRouter();
  const defaultNotifications =
    variant === "admin" ? defaultAdminNotifications : defaultUserNotifications;
  const notificationList = notifications || defaultNotifications;
  const count = unreadCount ?? notificationList.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking":
        return "📅";
      case "review":
        return "⭐";
      case "payment":
        return "💳";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    // In a real app, you would call an API to mark the notification as read
    console.log(`Marking notification ${notificationId} as read`);

    // Navigate to relevant page based on notification type
    const notification = notificationList.find((n) => n.id === notificationId);
    if (notification) {
      switch (notification.type) {
        case "booking":
          router.push(variant === "admin" ? "/admin/bookings" : "/bookings");
          break;
        case "review":
          router.push(variant === "admin" ? "/admin/reviews" : "/profile");
          break;
        case "payment":
          router.push(
            variant === "admin" ? "/admin/reports/revenue" : "/bookings"
          );
          break;
        default:
          break;
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notification menu</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">
              {count} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationList.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No notifications</span>
          </DropdownMenuItem>
        ) : (
          notificationList.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notification.read ? "bg-muted/50" : ""
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-sm">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {notificationList.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-primary cursor-pointer"
              onClick={() => {
                const route =
                  variant === "admin"
                    ? "/admin/notifications"
                    : "/notifications";
                router.push(route);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
