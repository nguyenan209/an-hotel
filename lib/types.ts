import {
  Booking,
  BookingItem,
  BookingStatus,
  BookingType,
  Homestay,
  HomestayStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  RoomStatus,
  UserRole,
} from "@prisma/client";

export interface CartItem {
  homestayId: string;
  homestay: Homestay;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  bookingType: BookingType;
  rooms?: {
    roomId: string;
    roomName: string;
    price: number;
  }[];
}

export interface Cart {
  items: CartItem[];
}

export interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
  roomsNeeded?: number;
}

export type Token = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  customerId: string;
};

export enum QRPaymentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export interface BookingWithHomestay extends Booking {
  homestay: Homestay;
  bookingItems: BookingItem[]; 
}