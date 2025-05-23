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
  status: "available" | "booked" | "maintenance";
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
  status: "active" | "inactive" | "maintenance";
}

export interface CartItem {
  homestayId: string;
  homestay: Homestay;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  bookingType: "whole" | "rooms";
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
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod: "pending" | "credit_card" | "bank_transfer" | "cash";
  bookingType: "whole" | "rooms";
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