"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Home,
  Hotel,
  User,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  BookingStatus,
  BookingType,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { BookingHomestayAndCustomer } from "@/lib/types";
import moment from "moment";
import Loading from "@/components/loading";

export default function BookingDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [booking, setBooking] = useState<BookingHomestayAndCustomer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch booking details from API
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/owner/bookings/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }
        const data = await response.json();
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (isLoading) {
    return <Loading />;
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Không tìm thấy đặt phòng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/owner/bookings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Booking #{booking.bookingNumber}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đặt phòng</CardTitle>
            <CardDescription>
              Xem chi tiết đặt phòng và trạng thái.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-2 border rounded-md bg-gray-100">
              <div className="font-medium">Homestay:</div>
              <div className="text-sm text-muted-foreground">
                {booking.homestay.name}
              </div>
            </div>

            <div className="p-2 border rounded-md bg-gray-100">
              <div className="font-medium">Khách hàng:</div>
              <div className="text-sm text-muted-foreground">
                {booking.customer.user.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 border rounded-md bg-gray-100">
                <div className="font-medium">Ngày đặt:</div>
                <div className="text-sm text-muted-foreground">
                  {moment(booking.checkIn).format("YYYY-MM-DD")}
                </div>
              </div>

              <div className="p-2 border rounded-md bg-gray-100">
                <div className="font-medium">Ngày rời:</div>
                <div className="text-sm text-muted-foreground">
                  {moment(booking.checkOut).format("YYYY-MM-DD")}
                </div>
              </div>
            </div>

            <div className="p-2 border rounded-md bg-gray-100">
              <div className="font-medium">Số lượng khách:</div>
              <div className="text-sm text-muted-foreground">
                {booking.guests}
              </div>
            </div>

            <div className="p-2 border rounded-md bg-gray-100">
              <div className="font-medium">Loại đặt phòng:</div>
              <div className="text-sm text-muted-foreground">
                {booking.bookingType === BookingType.WHOLE
                  ? "Whole Homestay"
                  : "Individual Rooms"}
              </div>
            </div>

            <div className="p-2 border rounded-md bg-gray-100">
              <div className="font-medium">Trạng thái:</div>
              <div className="text-sm text-muted-foreground">
                {booking.status}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông tin thanh toán</h3>

              <div className="p-2 border rounded-md bg-gray-100">
                <div className="font-medium">Trạng thái thanh toán:</div>
                <div className="text-sm text-muted-foreground">
                  {booking.paymentStatus}
                </div>
              </div>

              <div className="p-2 border rounded-md bg-gray-100">
                <div className="font-medium">Phương thức thanh toán:</div>
                <div className="text-sm text-muted-foreground">
                  {booking.paymentMethod}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan đặt phòng</CardTitle>
              <CardDescription>
                Tổng quan chi tiết đặt phòng và trạng thái.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Home className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">ID đặt phòng:</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.bookingNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Khách hàng:</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.customer.user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Thời gian ở:</h3>
                  <p className="text-sm text-muted-foreground">
                    {moment(booking.checkIn).format("YYYY-MM-DD")} to{" "}
                    {moment(booking.checkOut).format("YYYY-MM-DD")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.guests} khách
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                {booking.bookingType === BookingType.WHOLE ? (
                  <Home className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Hotel className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-medium">Loại đặt phòng:</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.bookingType === BookingType.WHOLE
                      ? "Toàn bộ homestay"
                      : "Cá nhân"}
                  </p>
                  {booking.bookingType === BookingType.ROOMS &&
                    booking.homestay.rooms && (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground">
                          Phòng đã chọn:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {booking.homestay.rooms.map((room: any) => (
                            <li key={room.roomId}>
                              {room.name} - {formatCurrency(room.price)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Thanh toán:</h3>
                  <p className="text-sm text-muted-foreground">
                    Trạng thái: {booking.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phương thức: {booking.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Phân tích giá:</h3>
                <div className="space-y-1 text-sm">
                  {booking.bookingType === BookingType.WHOLE ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Giá homestay
                      </span>
                      <span>{formatCurrency(booking.totalPrice * 0.9)}</span>
                    </div>
                  ) : (
                    booking.homestay.rooms?.map((room: any) => (
                      <div key={room.roomId} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {room.roomName}
                        </span>
                        <span>{formatCurrency(room.price)}</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thuế & phí</span>
                    <span>{formatCurrency(booking.totalPrice * 0.1)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
