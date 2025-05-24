import {
  Booking,
  BookingItem,
  BookingType,
  Homestay,
  Prisma,
  Room,
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

type HomestayWithOwner = Prisma.HomestayGetPayload<{
  include: { owner: true };
}>;

export interface BookingWithHomestay extends Booking {
  homestay: HomestayWithOwner;
  bookingItems: BookingItem[];
}

export interface RoomWithBeds  extends Room {
  beds: {
    id: string;
    type: string;
    count: number;
  }[];
}