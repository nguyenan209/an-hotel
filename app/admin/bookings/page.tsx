"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Eye, Home, Hotel, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { fetchBookings } from "@/lib/booking";
import { Booking, BookingStatus, BookingType } from "@prisma/client";
import moment from "moment";
import {
  BookingHomestayAndCustomer,
  BookingsResponse,
  BookingWithHomestay,
} from "@/lib/types";

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [bookingTypeFilter, setBookingTypeFilter] = useState<
    BookingType | "all"
  >("all");
  const [bookings, setBookings] = useState<BookingHomestayAndCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { bookings: initialBookings, hasMore } = await fetchBookings({
          search: searchQuery,
          status: statusFilter,
          bookingType: bookingTypeFilter,
          skip: 0,
          limit: 10,
        });

        setBookings(initialBookings);
        setHasMore(hasMore);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, statusFilter, bookingTypeFilter]);

  const loadMoreBookings = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const nextSkip = bookings.length;
      const { bookings: newBookings, hasMore: moreAvailable } =
        await fetchBookings({
          search: searchQuery,
          status: statusFilter,
          bookingType: bookingTypeFilter,
          skip: nextSkip,
          limit: 10,
        });

      // Loại bỏ các booking trùng lặp dựa trên id
      setBookings((prev) => {
        const bookingIds = new Set(prev.map((booking) => booking.id));
        const uniqueBookings = newBookings.filter(
          (booking: any) => !bookingIds.has(booking.id)
        );
        return [...prev, ...uniqueBookings];
      });

      setHasMore(moreAvailable);
    } catch (error) {
      console.error("Error loading more bookings:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Đặt phòng</h2>
        <Link href="/admin/bookings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới đặt phòng
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6 mt-5">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm đặt phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | BookingStatus)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={BookingStatus.PENDING}>
                    Chờ xác nhận
                  </SelectItem>
                  <SelectItem value={BookingStatus.CONFIRMED}>
                    Đã xác nhận
                  </SelectItem>
                  <SelectItem value={BookingStatus.COMPLETED}>
                    Đã hoàn thành
                  </SelectItem>
                  <SelectItem value={BookingStatus.CANCELLED}>
                    Đã hủy
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={bookingTypeFilter}
                onValueChange={(value) =>
                  setBookingTypeFilter(value as BookingType | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại đặt phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value={BookingType.WHOLE}>
                    Toàn bộ homestay
                  </SelectItem>
                  <SelectItem value={BookingType.ROOMS}>
                    Phòng riêng lẻ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Homestay</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Check-in / Check-out</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Không tìm thấy đặt phòng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        #{booking.bookingNumber}
                      </TableCell>
                      <TableCell>{booking.homestay.name}</TableCell>
                      <TableCell>{booking.customer.user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {`${moment(booking.checkIn).format(
                              "DD/MM/YYYY"
                            )} - ${moment(booking.checkOut).format(
                              "DD/MM/YYYY"
                            )}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.bookingType === BookingType.WHOLE ? (
                          <div className="flex items-center">
                            <Home className="mr-1 h-4 w-4" />
                            <span>Whole</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Hotel className="mr-1 h-4 w-4" />
                            <span>
                              {booking.homestay.rooms.length || 0}{" "}
                              {booking.homestay.rooms.length === 1
                                ? "Room"
                                : "Rooms"}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(booking.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Xem</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <InfiniteScroll
            onLoadMore={loadMoreBookings}
            hasMore={hasMore}
            isLoading={isLoadingMore}
          />
        </CardContent>
      </Card>
    </div>
  );
}
