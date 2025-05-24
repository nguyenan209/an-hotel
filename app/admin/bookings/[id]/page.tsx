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
import { BookingType } from "@prisma/client";

// Update the booking schema to include booking type
const bookingSchema = z.object({
  homestayId: z.string().min(1, "Homestay is required"),
  customerId: z.string().min(1, "Customer is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.coerce.number().min(1, "Number of guests must be at least 1"),
  status: z.string(),
  paymentStatus: z.string(),
  paymentMethod: z.string(),
  bookingType: z.enum([BookingType.ROOMS, BookingType.WHOLE]),
  selectedRooms: z.array(z.string()).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Update mock bookings to include booking type
const updatedMockBookings = mockBookings.map((booking, index) => ({
  ...booking,
  bookingType: index % 3 === 0 ? BookingType.ROOMS : BookingType.WHOLE,
  rooms:
    index % 3 === 0
      ? [
          { roomId: "1-1", roomName: "Master Suite", price: 500000 },
          { roomId: "1-2", roomName: "Deluxe Room", price: 400000 },
        ]
      : undefined,
}));

export default function BookingDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const isNewBooking = id === "new";
  const [booking, setBooking] = useState<any | null>(null);
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
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: "pending",
          bookingType: BookingType.WHOLE,
          selectedRooms: [],
        }
      : undefined,
  });

  const watchHomestayId = form.watch("homestayId");
  const watchBookingType = form.watch("bookingType");

  // Fetch available rooms when homestay changes
  useEffect(() => {
    if (watchHomestayId) {
      const fetchRooms = async () => {
        try {
          const rooms = await getRoomsByHomestayId(watchHomestayId);
          setAvailableRooms(rooms);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      };

      fetchRooms();
    }
  }, [watchHomestayId]);

  useEffect(() => {
    if (isNewBooking) {
      setIsLoading(false);
      return;
    }

    // Simulate API call to fetch booking details
    const fetchBooking = async () => {
      try {
        // In a real app, you would fetch from an API
        const foundBooking = updatedMockBookings.find((b) => b.id === id);

        if (foundBooking) {
          setBooking(foundBooking);
          form.reset({
            homestayId: foundBooking.homestayId,
            customerId: foundBooking.customerId,
            checkIn: foundBooking.checkIn,
            checkOut: foundBooking.checkOut,
            guests: foundBooking.guests,
            status: foundBooking.status,
            paymentStatus: foundBooking.paymentStatus,
            paymentMethod: foundBooking.paymentMethod,
            bookingType: foundBooking.bookingType,
            selectedRooms: foundBooking.rooms?.map((r: any) => r.roomId) || [],
          });

          // Fetch rooms for this homestay
          if (foundBooking.homestayId) {
            const rooms = await getRoomsByHomestayId(foundBooking.homestayId);
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

  const onSubmit = (data: BookingFormValues) => {
    // In a real app, you would submit to an API
    console.log("Form submitted:", data);

    // Simulate successful submission
    setTimeout(() => {
      router.push("/admin/bookings");
    }, 1000);
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
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewBooking ? "Create New Booking" : `Booking #${id}`}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  {isNewBooking
                    ? "Create a new booking by filling out the form below."
                    : "View and edit the booking details."}
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select homestay" />
                          </SelectTrigger>
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
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
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
                        <FormLabel>Check-in Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Check-out Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                      <FormLabel>Number of Guests</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
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
                      <FormLabel>Booking Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={BookingType.WHOLE}
                              id={BookingType.WHOLE}
                            />
                            <Label
                              htmlFor={BookingType.WHOLE}
                              className="flex items-center"
                            >
                              <Home className="mr-2 h-4 w-4" />
                              Whole Homestay
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rooms" id="rooms" />
                            <Label
                              htmlFor="rooms"
                              className="flex items-center"
                            >
                              <Hotel className="mr-2 h-4 w-4" />
                              Individual Rooms
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
                        <FormLabel>Select Rooms</FormLabel>
                        <div className="space-y-2">
                          {availableRooms.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No rooms available for this homestay
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
                      <FormLabel>Booking Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Information</h3>

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
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
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="credit_card">
                              Credit Card
                            </SelectItem>
                            <SelectItem value="bank_transfer">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/bookings">Cancel</Link>
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isNewBooking ? "Create Booking" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>

        {!isNewBooking && booking && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>
                  Overview of the booking details and status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Home className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{booking.homestayName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Homestay ID: {booking.homestayId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{booking.customerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Customer ID: {booking.customerId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Stay Duration</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.checkIn} to {booking.checkOut}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guests} guests
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
                    <h3 className="font-medium">Booking Type</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.bookingType === BookingType.WHOLE
                        ? "Whole Homestay"
                        : "Individual Rooms"}
                    </p>
                    {booking.bookingType === "rooms" && booking.rooms && (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground">
                          Selected Rooms:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {booking.rooms.map((room: any) => (
                            <li key={room.roomId}>
                              {room.roomName} - {formatCurrency(room.price)}
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
                    <h3 className="font-medium">Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {booking.paymentStatus}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Method: {booking.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Price Breakdown</h3>
                  <div className="space-y-1 text-sm">
                    {booking.bookingType === BookingType.WHOLE ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Homestay price
                        </span>
                        <span>{formatCurrency(booking.totalPrice * 0.9)}</span>
                      </div>
                    ) : (
                      booking.rooms?.map((room: any) => (
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
                        Taxes & fees
                      </span>
                      <span>{formatCurrency(booking.totalPrice * 0.1)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
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
