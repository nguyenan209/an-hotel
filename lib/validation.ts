import { BookingType } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const searchSchema = z.object({
  location: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().min(1).optional(),
  roomsNeeded: z.number().min(1).optional(),
});

export const bookingSchema = z.object({
  checkIn: z.string().min(1, "Vui lòng chọn ngày nhận phòng"),
  checkOut: z.string().min(1, "Vui lòng chọn ngày trả phòng"),
  guests: z.number().min(1, "Số khách phải ít nhất là 1"),
  bookingType: z.enum([BookingType.WHOLE, BookingType.ROOMS], {
    required_error: "Vui lòng chọn loại đặt phòng",
  }),
  selectedRooms: z.array(z.string()).optional(),
});
