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
import { pusherClient } from "@/lib/pusher/pusher-client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getNotificationChannel } from "@/lib/notification/channels";
import { NEW_NOTIFICATION_EVENT } from "@/lib/notification/events";
import { Notification, NotificationType } from "@prisma/client";
import { getNotificationIcon, getTimeAgo } from "@/lib/utils";

interface NotificationDropdownProps {
  unreadCount?: number;
  variant?: "admin" | "user";
}

export function NotificationDropdown({
  unreadCount,
  variant = "user",
}: NotificationDropdownProps) {
  const router = useRouter();
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [count, setCount] = useState(unreadCount ?? 0);
  const { user } = useAuth();

  if (!user) {
    router.push("/login");
    return;
  }

  // Gọi API để lấy danh sách thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?limit=3`);
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotificationList(data.notifications);
        setCount(data.pagination.unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user.id]);

  useEffect(() => {
    const channel = pusherClient.subscribe(getNotificationChannel(user.id));
    channel.bind(
      NEW_NOTIFICATION_EVENT,
      (data: { notification: Notification }) => {
        console.log("New notification received:", data.notification);
        setNotificationList((prev) => [data.notification, ...prev]);
        if (!data.notification.isRead) {
          setCount((prev) => prev + 1);
        }
      }
    );

    return () => {
      pusherClient.unsubscribe(getNotificationChannel(user.id));
    };
  }, [user.id, count]);

  const handleNotificationClick = (notificationId: string) => {
    // Navigate to relevant page based on notification type
    const notification = notificationList.find((n) => n.id === notificationId);
    if (notification) {
      switch (notification.type) {
        case NotificationType.BOOKING:
          router.push(variant === "admin" ? "/admin/bookings" : "/bookings");
          break;
        case NotificationType.REVIEW:
          router.push(variant === "admin" ? "/admin/reviews" : "/profile");
          break;
        case NotificationType.PAYMENT:
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
              {count}
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
          notificationList.slice(0, 3).map((notification) => (
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
