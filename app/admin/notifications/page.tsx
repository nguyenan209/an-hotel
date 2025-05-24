"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Mock data for notifications
const generateMockNotifications = () => {
  const types = [
    "booking",
    "review",
    "cancellation",
    "approval",
    "complaint",
    "system",
  ];
  const titles = {
    booking: "New booking request",
    review: "New review submitted",
    cancellation: "Booking cancellation request",
    approval: "New homestay approval request",
    complaint: "New customer complaint",
    system: "System notification",
  };
  const messages = {
    booking: [
      "A new booking has been made for Sunset Beach Villa",
      "A new booking has been made for Mountain Retreat",
      "A new booking has been made for Riverside Cottage",
    ],
    review: [
      "A new 5-star review has been submitted for Sunset Beach Villa",
      "A new 3-star review has been submitted for Mountain Retreat",
      "A new 4-star review has been submitted for Lakeside Villa",
    ],
    cancellation: [
      "A cancellation request has been submitted for booking #12345",
      "A cancellation request has been submitted for booking #67890",
      "A cancellation request has been submitted for booking #54321",
    ],
    approval: [
      'A new homestay "Ocean View Apartment" is waiting for approval',
      'A new homestay "Forest Cabin" is waiting for approval',
      'A new homestay "City Loft" is waiting for approval',
    ],
    complaint: [
      "A customer has filed a complaint about Sunset Beach Villa",
      "A customer has filed a complaint about Mountain Retreat",
      "A customer has filed a complaint about service quality",
    ],
    system: [
      "System maintenance scheduled for tonight at 2:00 AM",
      "New feature has been added to the admin dashboard",
      "Security update has been applied to the system",
    ],
  };

  const notifications = [];

  // Generate 50 random notifications
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)] as keyof typeof titles;
    const message =
      messages[type][Math.floor(Math.random() * messages[type].length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    date.setMinutes(date.getMinutes() - minutesAgo);

    notifications.push({
      id: `notif-${i + 1}`,
      type,
      title: titles[type],
      message,
      date,
      read: Math.random() > 0.3, // 30% chance of being unread
      link:
        type === "booking"
          ? "/admin/bookings"
          : type === "review"
          ? "/admin/reviews"
          : type === "cancellation"
          ? "/admin/bookings"
          : type === "approval"
          ? "/admin/approvals"
          : type === "complaint"
          ? "/admin/complaints"
          : "/admin",
    });
  }

  // Sort by date (newest first)
  return notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "booking":
      return <span className="text-xl">🏠</span>;
    case "review":
      return <span className="text-xl">⭐</span>;
    case "cancellation":
      return <span className="text-xl">❌</span>;
    case "approval":
      return <span className="text-xl">✅</span>;
    case "complaint":
      return <span className="text-xl">⚠️</span>;
    case "system":
      return <span className="text-xl">🔔</span>;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  return format(date, "dd/MM/yyyy", { locale: vi });
};

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    // Simulate API call to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const data = generateMockNotifications();
        setNotifications(data);
        setFilteredNotifications(data);
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
  }, [toast]);

  useEffect(() => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab !== "all") {
      if (activeTab === "unread") {
        filtered = filtered.filter((notif) => !notif.read);
      } else {
        filtered = filtered.filter((notif) => notif.type === activeTab);
      }
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (notif) =>
          (filterStatus === "read" && notif.read) ||
          (filterStatus === "unread" && !notif.read)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(query) ||
          notif.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [notifications, activeTab, filterType, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    toast({
      title: "Thông báo đã được đánh dấu là đã đọc",
      duration: 2000,
    });
  };

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
    );
    toast({
      title: "Thông báo đã được đánh dấu là chưa đọc",
      duration: 2000,
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast({
      title: "Thông báo đã được xóa",
      duration: 2000,
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast({
      title: "Tất cả thông báo đã được đánh dấu là đã đọc",
      duration: 2000,
    });
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "booking":
        return "Đặt phòng";
      case "review":
        return "Đánh giá";
      case "cancellation":
        return "Hủy đặt phòng";
      case "approval":
        return "Phê duyệt";
      case "complaint":
        return "Khiếu nại";
      case "system":
        return "Hệ thống";
      default:
        return type;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "cancellation":
        return "bg-red-100 text-red-800";
      case "approval":
        return "bg-green-100 text-green-800";
      case "complaint":
        return "bg-orange-100 text-orange-800";
      case "system":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

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
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại thông báo</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="booking">Đặt phòng</SelectItem>
                    <SelectItem value="review">Đánh giá</SelectItem>
                    <SelectItem value="cancellation">Hủy đặt phòng</SelectItem>
                    <SelectItem value="approval">Phê duyệt</SelectItem>
                    <SelectItem value="complaint">Khiếu nại</SelectItem>
                    <SelectItem value="system">Hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 md:grid-cols-6">
                  <TabsTrigger value="all">
                    Tất cả
                    <Badge variant="secondary" className="ml-2">
                      {notifications.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Chưa đọc
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="booking">Đặt phòng</TabsTrigger>
                  <TabsTrigger value="review">Đánh giá</TabsTrigger>
                  <TabsTrigger value="complaint">Khiếu nại</TabsTrigger>
                  <TabsTrigger value="system">Hệ thống</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : currentNotifications.length === 0 ? (
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
                  {currentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read ? "bg-white" : "bg-blue-50"
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
                                {!notification.read && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getTimeAgo(notification.date)}
                                </span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-xs text-blue-600"
                                  onClick={() =>
                                    (window.location.href = notification.link)
                                  }
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
                                {notification.read ? (
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

                        {Array.from({ length: totalPages }).map((_, i) => {
                          // Show first page, last page, and pages around current page
                          if (
                            i === 0 ||
                            i === totalPages - 1 ||
                            (i >= currentPage - 2 && i <= currentPage + 2)
                          ) {
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(i + 1);
                                  }}
                                  isActive={currentPage === i + 1}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }

                          // Show ellipsis if there's a gap
                          if (
                            (i === 1 && currentPage > 3) ||
                            (i === totalPages - 2 &&
                              currentPage < totalPages - 2)
                          ) {
                            return (
                              <PaginationItem key={i}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }

                          return null;
                        })}

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
