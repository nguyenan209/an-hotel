"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BookingWithHomestay } from "@/lib/types";
import { BookingStatus } from "@prisma/client";
import moment from "moment";
import { getStatusBadge } from "@/components/booking/status-badge";
import { calculateNights } from "@/lib/utils";
import Loading from "@/components/loading";
import { useQuery } from "@tanstack/react-query";

async function fetchBookings() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

export default function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    enabled: !!user,
  });

  useEffect(() => {
    if (user !== undefined) {
      setIsLoggedIn(true);
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn && !user) {
      router.push("/login");
    }
  }, [isLoggedIn, user, router]);

  const viewBookingDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  const filterBookings = (status: BookingStatus | "all") => {
    if (status === "all") return bookings;
    return bookings.filter((booking: BookingWithHomestay) => booking.status === status);
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
    setCurrentPage(1);
  }, [useSearchParams().get("tab")]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500 mb-4">{(error as Error).message || "Không thể tải danh sách đặt phòng"}</p>
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
          <TabsTrigger value={BookingStatus.COMPLETED}>Completed</TabsTrigger>
          <TabsTrigger value={BookingStatus.CANCELLED}>Cancelled</TabsTrigger>
          <TabsTrigger value={BookingStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={BookingStatus.PAID}>Paid</TabsTrigger>
        </TabsList>

        {[
          "all",
          BookingStatus.COMPLETED,
          BookingStatus.CANCELLED,
          BookingStatus.PENDING,
          BookingStatus.PAID,
        ].map((status) => {
          const filteredBookings = filterBookings(status as BookingStatus | "all");
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
                                  Booked on {" "}
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

