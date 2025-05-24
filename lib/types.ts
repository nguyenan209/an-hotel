import { BookingStatus, BookingType, HomestayStatus, Payment, PaymentMethod, PaymentStatus, RoomStatus } from "@prisma/client";

export interface Room {
  id: string;
  homestayId: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  beds: {
    type: string;
    count: number;
  }[];
  amenities: string[];
  images: string[];
  status: RoomStatus;
}

export interface Homestay {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number; // Price for booking entire homestay
  rating: number;
  maxGuests: number;
  totalRooms: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  allowsPartialBooking: boolean; // Whether individual rooms can be booked
  status: HomestayStatus;
}

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

export interface Booking {
  id: string;
  homestayId: string;
  homestayName: string;
  customerId: string;
  customerName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  paymentStatus:PaymentStatus;
  paymentMethod: PaymentMethod;
  bookingType: BookingType;
  rooms?: {
    roomId: string;
    roomName: string;
    price: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
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


export enum QRPaymentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}