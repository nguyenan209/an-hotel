"use client";

import { useState, useEffect, use } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BookingWithHomestay } from "@/lib/types";
import { BookingStatus } from "@prisma/client";
import moment from "moment";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithHomestay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Trạng thái kiểm tra xác thực
  const router = useRouter();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoggedIn(true); // Đánh dấu quá trình xác thực đã hoàn tất
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn && !user) {
      router.push("/login"); // Chuyển hướng nếu không có user
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`, // Thêm token từ localStorage
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Không thể tải danh sách đặt phòng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.UPCOMING:
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case BookingStatus.COMPLETED:
        return <Badge className="bg-green-500">Completed</Badge>;
      case BookingStatus.CANCELLED:
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case BookingStatus.PENDING:
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const viewBookingDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  const filterBookings = (status: BookingStatus | "all") => {
    if (status === "all") return bookings;
    return bookings.filter((booking) => booking.status === status);
  };

  const paginateBookings = (
    bookings: any[],
    page: number,
    itemsPerPage: number
  ) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return bookings.slice(startIndex, endIndex);
  };

  useEffect(() => {
    // Reset to first page when changing tabs
    setCurrentPage(1);
  }, [router.query?.tab]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.refresh()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value={BookingStatus.UPCOMING}>Upcoming</TabsTrigger>
          <TabsTrigger value={BookingStatus.COMPLETED}>Completed</TabsTrigger>
          <TabsTrigger value={BookingStatus.CANCELLED}>Cancelled</TabsTrigger>
          <TabsTrigger value={BookingStatus.PENDING}>Pending</TabsTrigger>
        </TabsList>

        {[
          "all",
          BookingStatus.UPCOMING,
          BookingStatus.COMPLETED,
          BookingStatus.CANCELLED,
        ].map((status) => {
          const filteredBookings = filterBookings(status);
          const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
          const paginatedBookings = paginateBookings(
            filteredBookings,
            currentPage,
            itemsPerPage
          );

          return (
            <TabsContent key={status} value={status} className="space-y-6">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-500">No bookings found</p>
                </div>
              ) : (
                <>
                  {paginatedBookings.map((booking: BookingWithHomestay) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto relative">
                          <img
                            src={
                              booking.homestay.images[0] || "/placeholder.svg"
                            }
                            alt={booking.homestay.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{booking.homestay.name}</CardTitle>
                                <CardDescription className="text-base mt-1">
                                  Booked at{" "}
                                  {moment(booking.createdAt).format(
                                    "MMMM Do YYYY, h:mm A"
                                  )}
                                </CardDescription>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>
                                  {moment(booking.checkIn).format(
                                    "MMMM Do YYYY"
                                  )}{" "}
                                  -{" "}
                                  {moment(booking.checkOut).format(
                                    "MMMM Do YYYY"
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>
                                  {booking.guests}{" "}
                                  {booking.guests > 1 ? "guests" : "guest"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{booking.homestay.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                  {calculateNights(
                                    booking.checkIn.toString(),
                                    booking.checkOut.toString()
                                  )}{" "}
                                  nights
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center">
                            <div className="font-bold text-lg">
                              ${booking.totalPrice.toLocaleString()}
                            </div>
                            <Button
                              onClick={() => viewBookingDetails(booking.id)}
                            >
                              View Details
                            </Button>
                          </CardFooter>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            className="w-10 h-10 p-0"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
