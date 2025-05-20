import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
