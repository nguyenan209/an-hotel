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
import { usePathname, useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { getNotificationChannel } from "@/lib/notification/channels";
import { NEW_NOTIFICATION_EVENT } from "@/lib/notification/events";
import { getNotificationIcon, getTimeAgo } from "@/lib/utils";

interface NotificationDropdownProps {
  variant?: "admin" | "user";
}

export function NotificationDropdown({
  variant = "user",
}: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();

  // Sử dụng notificationStore
  const {
    notifications,
    globalUnreadCount,
    fetchNotifications,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Chỉ gọi API nếu không ở trang /notifications
    if (pathname !== "/notifications") {
      fetchNotifications({
        page: 1,
        limit: 3,
        type: "all",
        status: "all",
        query: "",
      });
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe(getNotificationChannel(user.id));
    channel.bind(
      NEW_NOTIFICATION_EVENT,
      (data: { notification: Notification }) => {
        console.log("New notification received:", data.notification);
        fetchNotifications({
          page: 1,
          limit: 3,
          type: "all",
          status: "all",
          query: "",
        });
      }
    );

    return () => {
      pusherClient.unsubscribe(getNotificationChannel(user.id));
    };
  }, [user, fetchNotifications]);

  const handleNotificationClick = (notificationId: string) => {
    // Đánh dấu thông báo là đã đọc
    markAsRead(notificationId);

    // Điều hướng đến trang liên quan
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      switch (notification.type) {
        case "BOOKING":
          router.push(variant === "admin" ? "/admin/bookings" : "/bookings");
          break;
        case "REVIEW":
          router.push(variant === "admin" ? "/admin/reviews" : "/profile");
          break;
        case "PAYMENT":
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
          {globalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {globalUnreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {globalUnreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {globalUnreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No notifications</span>
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 3).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notification.isRead ? "bg-muted/50" : ""
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-sm">
                  {`${getNotificationIcon(notification.type)}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTimeAgo(new Date(notification.createdAt))}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {notifications.length > 0 && (
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