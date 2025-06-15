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
import {
  BookingHomestayAndCustomer,
  BookingsResponse,
} from "@/lib/types";
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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/bookings?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  return response.json();
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [bookingTypeFilter, setBookingTypeFilter] = useState<BookingType | "all">("all");
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
    queryFn: ({ pageParam = 0 }) => fetchBookings({
      search: searchQuery,
      status: statusFilter,
      bookingType: bookingTypeFilter,
      skip: pageParam as number * limit,
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
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Bookings</CardTitle>
          <CardDescription>
            You have a total of {bookings.length} bookings in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search bookings..."
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
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={BookingStatus.CONFIRMED}>
                    Confirmed
                  </SelectItem>
                  <SelectItem value={BookingStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={BookingStatus.CANCELLED}>
                    Cancelled
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
                  <SelectValue placeholder="Filter by booking type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={BookingType.WHOLE}>
                    Whole Homestay
                  </SelectItem>
                  <SelectItem value={BookingType.ROOMS}>
                    Individual Rooms
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Check-in / Check-out</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No bookings found
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
                            {`${moment(booking.checkIn).format("DD/MM/YYYY")} - ${moment(booking.checkOut).format("DD/MM/YYYY")}`}
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
                        <Link href={`/owner/bookings/${booking.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
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
