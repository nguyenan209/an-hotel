import { z } from "zod";

export const homestaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be non-negative"),
  maxGuests: z.number().int().min(1, "Max guests must be at least 1"),
  totalRooms: z.number().int().min(0, "Total rooms cannot be negative"),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "PENDING", "REJECTED"]).default("ACTIVE"),
  amenities: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  allowsPartialBooking: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  location: z.array(z.number()).default([]),
});

export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  status: z.string(),
  amenities: z.array(z.string()),
  bedTypes: z.array(
    z.object({
      type: z.string(),
      count: z.coerce.number().min(1),
    })
  ),
});
