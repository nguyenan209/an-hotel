import {
  Booking,
  BookingItem,
  BookingStatus,
  BookingType,
  Homestay,
  NotificationType,
  PaymentMethod,
  Prisma,
  Room,
  User,
  UserRole,
} from "@prisma/client";

export interface CartItem {
  id?: string;
  homestayId: string;
  homestay: Homestay;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number; 
  bookingType: BookingType;
  rooms?: RoomCart[];
  note?: string;
  totalPrice: number;
}

export interface RoomCart  {
  roomId: string;
  roomName: string;
  price: number;
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

export interface Token {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  customerId: string;
}

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

export interface RoomWithBeds extends Room {
  beds: {
    id: string;
    type: string;
    count: number;
  }[];
}

export type FetchBookingsParams = {
  search?: string;
  status?: string;
  bookingType?: string;
  skip: number;
  limit: number;
};

export interface BookingHomestayAndCustomer extends Booking {
  homestay: {
    id: Homestay["id"];
    name: Homestay["name"];
    address: Homestay["address"];
    images: Homestay["images"];
    rooms: {
      id: string;
    }[];
  };
  customer: {
    id: User["id"];
    user: {
      id: User["id"];
      name: User["name"];
      email: User["email"];
      phone: User["phone"];
      avatar: User["avatar"];
    };
  };
}

export interface BookingsResponse {
  bookings: BookingHomestayAndCustomer[];
  hasMore: boolean;
}

export interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    amenities?: string;
  }>;
}
export interface RoomPayload {
  roomId: string;
  roomName: string;
  pricePerNight: number;
}

export interface BookingItemPayload {
  homestayId: string;
  homestayName: string;
  checkIn: string; // ISO 8601 date string
  checkOut: string; // ISO 8601 date string
  guests: number;
  nights: number;
  bookingType: BookingType;
  note: string;
  rooms: RoomPayload[];
  totalPrice: number;
}

export interface BookingPayload {
  paymentMethod: PaymentMethod;
  totalAmount: number;
  currency: string;
  items: BookingItemPayload[];
  status: BookingStatus;
}

export interface PaymentDetails {
  qrStatus: QRPaymentStatus;
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  };
}

export interface CheckoutPayload {
  paymentMethod: PaymentMethod;
  bookingData: BookingPayload;
  paymentDetails?: PaymentDetails;
}

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType; // Nếu chỉ có 'BOOKING' thì dùng literal, nếu có thêm thì mở rộng
  isRead: boolean;
  relatedId: string | null;
  createdAt: string; // ISO date string
  link: string | null;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NotificationResponse = {
  notifications: Notification[];
  pagination: Pagination;
};
