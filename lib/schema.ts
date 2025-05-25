import {
  BedType,
  BookingStatus,
  BookingType,
  HomestayStatus,
  PaymentMethod,
  PaymentStatus,
  RoomStatus,
} from "@prisma/client";
import { z } from "zod";

export const homestaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  maxGuests: z.coerce.number().int().min(1, "Max guests must be at least 1"),
  totalRooms: z.number().int().min(0, "Total rooms cannot be negative"),
  status: z.nativeEnum(HomestayStatus, {
    errorMap: () => ({ message: "Status is required" }),
  }),
  amenities: z.array(z.string()).optional(),
  featured: z.boolean(),
  allowsPartialBooking: z.boolean(),
  images: z.array(z.string()).optional(),
  location: z.array(z.number()),
});

export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be greater than 0"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  status: z.nativeEnum(RoomStatus, {
    errorMap: () => ({ message: "Status is required" }),
  }),
  amenities: z.array(z.string()),
  bedTypes: z.array(
    z.object({
      type: z.nativeEnum(BedType, {
        errorMap: () => ({ message: "Bed type is required" }),
      }),
      count: z.coerce.number().min(1),
    })
  ),
  homestayId: z.string(),
  images: z.array(z.string()).optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  status: z.string(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const bookingSchema = z.object({
  homestayId: z.string().min(1, "Homestay is required"),
  customerId: z.string().min(1, "Customer is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.coerce.number().min(1, "Number of guests must be at least 1"),
  status: z.nativeEnum(BookingStatus, {
    errorMap: () => ({ message: "Booking status is required" }),
  }),
  paymentStatus: z.nativeEnum(PaymentStatus, {
    errorMap: () => ({ message: "Payment status is required" }),
  }),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Payment method is required" }),
  }),
  bookingType: z.enum([BookingType.ROOMS, BookingType.WHOLE]),
  selectedRooms: z.array(z.string()).optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
