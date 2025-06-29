"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Eye, Home, Hotel } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

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
import { Booking, BookingStatus, BookingType } from "@prisma/client";
import moment from "moment";
import { BookingHomestayAndCustomer, BookingsResponse } from "@/lib/types";
import Loading from "@/components/loading";

async function fetchBookings({
  search,
  status,
  bookingType,
  skip,
  limit,
}: {
  search: string;
  status: BookingStatus | "all";
  bookingType: BookingType | "all";
  skip: number;
  limit: number;
}): Promise<BookingsResponse> {
  const params = new URLSearchParams({
    search: search || "",
    status: status || "all",
    bookingType: bookingType || "all",
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/owner/bookings?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  return response.json();
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [bookingTypeFilter, setBookingTypeFilter] = useState<
    BookingType | "all"
  >("all");
  const limit = 10;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<BookingsResponse>({
    queryKey: ["bookings", searchQuery, statusFilter, bookingTypeFilter],
    queryFn: ({ pageParam = 0 }) =>
      fetchBookings({
        search: searchQuery,
        status: statusFilter,
        bookingType: bookingTypeFilter,
        skip: (pageParam as number) * limit,
        limit,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.bookings.length / limit;
    },
  });

  const bookings = data?.pages.flatMap((page) => page.bookings) || [];

  const loadMoreBookings = async () => {
    if (isFetchingNextPage || !hasNextPage) return;
    await fetchNextPage();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div>{(error as Error).message || "Failed to load bookings"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Đặt phòng</h2>
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
                  <SelectItem value={BookingType.ROOMS}>Cá nhân</SelectItem>
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
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Loại đặt phòng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
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
                  bookings.map((booking: BookingHomestayAndCustomer) => (
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
                            <span>Toàn bộ homestay</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Hotel className="mr-1 h-4 w-4" />
                            <span>
                              {booking.homestay.rooms.length || 0} phòng
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
                        <Link href={`/owner/bookings/${booking.id}`}>
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
            hasMore={hasNextPage || false}
            isLoading={isFetchingNextPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
