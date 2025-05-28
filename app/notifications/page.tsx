"use client";

import { getNotificationIcon } from "@/components/notification/get-notification-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Notification } from "@/lib/types";
import {
  getNotificationTypeColor,
  getNotificationTypeLabel,
  getTimeAgo,
} from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import {
  Bell,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?page=${currentPage}&limit=${itemsPerPage}&type=${filterType}&status=${filterStatus}&query=${searchQuery}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data.notifications);
        setTotalPages(data.pagination.totalPages);
        setTotalNotifications(data.pagination.total); // Tổng số thông báo
        setUnreadNotifications(data.pagination.unreadCount); // Tổng số chưa đọc
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage, itemsPerPage, filterType, filterStatus, searchQuery, toast]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );

      // Giảm số lượng chưa đọc nếu thông báo trước đó chưa được đọc
      const updatedNotification = notifications.find(
        (notif) => notif.id === id
      );
      if (updatedNotification && !updatedNotification.isRead) {
        setUnreadNotifications((prev) => prev - 1);
      }

      toast({
        title: "Thông báo đã được đánh dấu là đã đọc",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as unread");
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: false } : notif
        )
      );

      // Tăng số lượng chưa đọc nếu thông báo trước đó đã được đọc
      const updatedNotification = notifications.find(
        (notif) => notif.id === id
      );
      if (updatedNotification && updatedNotification.isRead) {
        setUnreadNotifications((prev) => prev + 1);
      }

      toast({
        title: "Thông báo đã được đánh dấu là chưa đọc",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as unread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      // Lấy thông báo bị xóa để kiểm tra trạng thái `isRead`
      const deletedNotification = notifications.find(
        (notif) => notif.id === id
      );

      // Cập nhật danh sách thông báo
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));

      // Giảm tổng số thông báo
      setTotalNotifications((prev) => prev - 1);

      // Nếu thông báo bị xóa chưa được đọc, giảm số lượng chưa đọc
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadNotifications((prev) => prev - 1);
      }

      toast({
        title: "Thông báo đã được xóa",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadNotifications(0); // Cập nhật số lượng chưa đọc về 0

      toast({
        title: "Tất cả thông báo đã được đánh dấu là đã đọc",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description:
          "Failed to mark all notifications as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset về trang đầu tiên

    if (value === "all") {
      setFilterType("all");
    } else if (value === "unread") {
      setFilterStatus("unread");
    } else {
      setFilterType(value as NotificationType);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Đánh dấu tất cả là đã đọc
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm thông báo..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại thông báo</label>
                <Select
                  value={filterType}
                  onValueChange={(value) => {
                    setFilterType(value as NotificationType | "all");
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value={NotificationType.BOOKING}>
                      Đặt phòng
                    </SelectItem>
                    <SelectItem value={NotificationType.REVIEW}>
                      Đánh giá
                    </SelectItem>
                    <SelectItem value={NotificationType.CANCELLED}>
                      Hủy đặt phòng
                    </SelectItem>
                    <SelectItem value={NotificationType.APPROVAL}>
                      Phê duyệt
                    </SelectItem>
                    <SelectItem value={NotificationType.COMPLAINT}>
                      Khiếu nại
                    </SelectItem>
                    <SelectItem value={NotificationType.SYSTEM}>
                      Hệ thống
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => {
                    setFilterStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="read">Đã đọc</SelectItem>
                    <SelectItem value="unread">Chưa đọc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setFilterStatus("all");
                    setActiveTab("all");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <Tabs
                value={activeTab}
                onValueChange={(value) => handleTabChange(value)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 md:grid-cols-6">
                  <TabsTrigger value="all">
                    Tất cả
                    <Badge variant="secondary" className="ml-2">
                      {totalNotifications}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Chưa đọc
                    <Badge variant="secondary" className="ml-2">
                      {unreadNotifications}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value={NotificationType.BOOKING}>
                    Đặt phòng
                  </TabsTrigger>
                  <TabsTrigger value={NotificationType.REVIEW}>
                    Đánh giá
                  </TabsTrigger>
                  <TabsTrigger value={NotificationType.COMPLAINT}>
                    Khiếu nại
                  </TabsTrigger>
                  <TabsTrigger value={NotificationType.SYSTEM}>
                    Hệ thống
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    Không có thông báo
                  </h3>
                  <p className="text-muted-foreground">
                    Không tìm thấy thông báo nào phù hợp với bộ lọc hiện tại.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.isRead ? "bg-white" : "bg-blue-50"
                      } transition-colors`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationTypeColor(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                {notification.title}
                                <Badge
                                  variant="outline"
                                  className={getNotificationTypeColor(
                                    notification.type
                                  )}
                                >
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                {!notification.isRead && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getTimeAgo(new Date(notification.createdAt))}
                                </span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-xs text-blue-600"
                                  onClick={() => {
                                    notification.link &&
                                      (window.location.href =
                                        notification.link);
                                  }}
                                >
                                  Xem chi tiết
                                </Button>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {notification.isRead ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      markAsUnread(notification.id)
                                    }
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Đánh dấu chưa đọc
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Đánh dấu đã đọc
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa thông báo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1)
                                setCurrentPage(currentPage - 1);
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(i + 1);
                              }}
                              isActive={currentPage === i + 1} // Đánh dấu trang hiện tại
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages)
                                setCurrentPage(currentPage + 1);
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
