"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Home,
  Hotel,
  User,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  mockBookings,
  mockCustomers,
  mockHomestays,
} from "@/lib/mock-data/admin";
import { formatCurrency } from "@/lib/utils";
import { getRoomsByHomestayId } from "@/lib/data";
import {
  Booking,
  BookingStatus,
  BookingType,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { BookingFormValues, bookingSchema } from "@/lib/schema";
import { BookingHomestayAndCustomer } from "@/lib/types";
import { HomestayCombobox } from "@/components/homestay/homestay-compobox";
import moment from "moment";

export default function BookingDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const isNewBooking = id === "new";
  const [booking, setBooking] = useState<BookingHomestayAndCustomer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(!isNewBooking);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: isNewBooking
      ? {
          homestayId: "",
          customerId: "",
          checkIn: "",
          checkOut: "",
          guests: 1,
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.CASH,
          bookingType: BookingType.WHOLE,
          selectedRooms: [],
        }
      : undefined,
  });

  const watchHomestayId = form.watch("homestayId");
  const watchBookingType = form.watch("bookingType");

  // Fetch booking details from API
  useEffect(() => {
    if (isNewBooking) {
      setIsLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }
        const data = await response.json();
        console.log("Fetched booking data:", data);

        setBooking(data);
        form.reset({
          homestayId: data.homestay.bookingNumber,
          customerId: data.customer.id,
          checkIn: moment(data.checkIn).format("YYYY-MM-DD"), // Định dạng ngày
          checkOut: moment(data.checkOut).format("YYYY-MM-DD"), // Định dạng ngày
          guests: data.guests,
          status: data.status,
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod,
          bookingType: data.bookingType,
          selectedRooms: data.rooms?.map((r: any) => r.id) || [],
        });

        // Fetch rooms for this homestay
        if (data.homestayId) {
          const roomsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/homestays/${data.homestayId}/rooms`
          );
          if (roomsResponse.ok) {
            const rooms = await roomsResponse.json();
            setAvailableRooms(rooms);
          }
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id, isNewBooking, form]);

  const onSubmit = async (data: BookingFormValues) => {
    try {
      const response = await fetch(
        isNewBooking ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings/${id}`,
        {
          method: isNewBooking ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save booking");
      }

      router.push("/admin/bookings");
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewBooking ? "Thêm mới đặt phòng" : `Đặt phòng #${id}`}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đặt phòng</CardTitle>
                <CardDescription>
                  {isNewBooking
                    ? "Tạo mới đặt phòng bằng cách điền vào form bên dưới."
                    : "Xem và chỉnh sửa chi tiết đặt phòng."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="homestayId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Homestay</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={true}
                      >
                        <FormControl>
                          {isNewBooking ? (
                            <HomestayCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Chọn homestay"
                              showAllOption={false}
                            />
                          ) : (
                            <div className="p-2 border rounded-md bg-gray-100">
                              {booking?.homestay.name || "Select homestay"}
                            </div>
                          )}
                        </FormControl>
                        <SelectContent>
                          {mockHomestays.map((homestay) => (
                            <SelectItem key={homestay.id} value={homestay.id}>
                              {homestay.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khách hàng</FormLabel>
                      {isNewBooking ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={true}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn khách hàng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockCustomers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 border rounded-md bg-gray-100">
                          {booking?.customer.user.name || "Select customer"}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày check-in</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={true} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày check-out</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={true} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng khách</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Loại đặt phòng</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={true}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={BookingType.WHOLE}
                              id={BookingType.WHOLE}
                              disabled={true}
                            />
                            <Label
                              htmlFor={BookingType.WHOLE}
                              className="flex items-center"
                            >
                              <Home className="mr-2 h-4 w-4" />
                              Toàn bộ homestay
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={BookingType.ROOMS}
                              id={BookingType.ROOMS}
                              disabled={true}
                            />
                            <Label
                              htmlFor={BookingType.ROOMS}
                              className="flex items-center"
                            >
                              <Hotel className="mr-2 h-4 w-4" />
                              Phòng riêng lẻ
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchBookingType === BookingType.ROOMS && watchHomestayId && (
                  <FormField
                    control={form.control}
                    name="selectedRooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn phòng</FormLabel>
                        <div className="space-y-2">
                          {availableRooms.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Không có phòng nào có sẵn cho homestay này
                            </p>
                          ) : (
                            availableRooms.map((room) => (
                              <div
                                key={room.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  id={`room-${room.id}`}
                                  checked={field.value?.includes(room.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const updatedRooms = checked
                                      ? [...(field.value || []), room.id]
                                      : (field.value || []).filter(
                                          (id) => id !== room.id
                                        );
                                    field.onChange(updatedRooms);
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`room-${room.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {room.name} - {formatCurrency(room.price)} /
                                  night (Max {room.capacity} guests)
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái đặt phòng</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={true}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Thông tin thanh toán</h3>

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái thanh toán</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={true}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PaymentStatus.PENDING}>
                              Chờ thanh toán
                            </SelectItem>
                            <SelectItem value={PaymentStatus.PAID}>
                              Đã thanh toán
                            </SelectItem>
                            <SelectItem value={PaymentStatus.REFUNDED}>
                              Đã hoàn tiền
                            </SelectItem>
                            <SelectItem value={PaymentStatus.FAILED}>
                              Đã hủy
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={true}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phương thức thanh toán" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PaymentMethod.CREDIT_CARD}>
                              Thẻ tín dụng
                            </SelectItem>
                            <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                              Chuyển khoản
                            </SelectItem>
                            <SelectItem value={PaymentMethod.CASH}>
                              Tiền mặt
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {(isNewBooking && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/bookings">Hủy</Link>
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  {isNewBooking ? "Tạo đặt phòng" : "Lưu thay đổi"}
                </Button>
              </div>
            )) ||
              null}
          </form>
        </Form>

        {!isNewBooking && booking && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan đặt phòng</CardTitle>
                <CardDescription>
                  Tổng quan chi tiết và trạng thái của đặt phòng.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Home className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{booking.bookingNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Homestay ID: {booking.homestay.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">
                      {booking.customer.user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Customer ID: {booking.customer.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Thời gian ở</h3>
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
                    <h3 className="font-medium">Loại đặt phòng</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.bookingType === BookingType.WHOLE
                        ? "Toàn bộ homestay"
                        : "Phòng riêng lẻ"}
                    </p>
                    {booking.bookingType === BookingType.ROOMS &&
                      booking.homestay.rooms && (
                        <div className="mt-1">
                          <p className="text-sm text-muted-foreground">
                            Chọn phòng:
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
                    <h3 className="font-medium">Thanh toán</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {booking.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phương thức: {booking.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Bảng giá</h3>
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
                      <span className="text-muted-foreground">
                        Thuế & phí
                      </span>
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
        )}
      </div>
    </div>
  );
}
