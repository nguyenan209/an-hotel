import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateHash } from "./hash";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { NotificationType } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export const debounceSearch = (fn: (query: string) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (query: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(query), delay);
  };
};

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
    case "available":
    case "confirmed":
    case "completed":
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
    case "maintenance":
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800";
    case "booked":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getExpireOtpTime(): Date {
  const otpExpirationTime =
    parseInt(process.env.NEXT_PUBLIC_OTP_EXPIRATION_TIME || "300", 10) * 1000;
  const expiryTime = new Date(Date.now() + otpExpirationTime * 60 * 1000);
  return expiryTime;
}

export function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export const CANCELLATION_POLICIES =
  "Free cancellation up to 7 days before check-in. After that, 50% of the total amount will be charged.";

export const generateBookingNumber = (payload: any): string => {
  const bookingNumber = `AN-HOTEL-BK${generateHash(payload)}`;
  return bookingNumber.toUpperCase();
};

export function calculateCartTotal(
  cartItems: Array<{
    rooms?: Array<{ price: number }>;
    homestay: { price: number };
    nights: number;
  }>
): number {
  console.log("cartItems", cartItems);
  return cartItems.reduce((total, cartItem) => {
    const itemTotal = cartItem.rooms?.length
      ? cartItem.rooms.reduce(
          (roomTotal, room) => roomTotal + room.price * cartItem.nights,
          0
        )
      : cartItem.homestay.price * cartItem.nights;

    return total + itemTotal;
  }, 0);
}

export const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  return format(date, "dd/MM/yyyy", { locale: vi });
};

export const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case "booking":
      return "bg-blue-100 text-blue-800";
    case "review":
      return "bg-yellow-100 text-yellow-800";
    case "cancellation":
      return "bg-red-100 text-red-800";
    case "approval":
      return "bg-green-100 text-green-800";
    case "complaint":
      return "bg-orange-100 text-orange-800";
    case "system":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case "booking":
      return "Đặt phòng";
    case "review":
      return "Đánh giá";
    case "cancellation":
      return "Hủy đặt phòng";
    case "approval":
      return "Phê duyệt";
    case "complaint":
      return "Khiếu nại";
    case "system":
      return "Hệ thống";
    default:
      return type;
  }
};

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.BOOKING:
      return "📅";
    case NotificationType.REVIEW:
      return "⭐";
    case NotificationType.PAYMENT:
      return "💳";
    case NotificationType.SYSTEM:
      return "🔔";
    default:
      return "📢";
  }
};
