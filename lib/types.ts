import {
  Booking,
  BookingItem,
  BookingStatus,
  BookingType,
  Homestay,
  NotificationType,
  PaymentMethod,
  Prisma,
  Review,
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

export interface RoomCart {
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

export interface ReviewResponse extends Partial<Review> {
  customer: {
    user: {
      id: string;
      name: string;
      avatar?: string;
      email?: string;
      phone?: string;
    };
  };
  id: string;
}

export interface AdminReviewsResponse {
  id: string;
  ownerReply: string | null;
  ownerReplyDate: string | null;
  homestayId: string;
  bookingId: string;
  booking: {
    id: string;
    checkIn: string;
    checkOut: string;
  };
  homestay: {
    id: string;
    name: string;
    address: string;
    images: string[];
  };
  customerId: string;
  customer: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
  };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface AdminHomestayRepsonse {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  status: string;
}
// Tạo kiểu dữ liệu cho Review với tất cả các quan hệ được bao gồm
export type ReviewAll = Prisma.ReviewGetPayload<{
  include: {
    customer: {
      include: {
        user: true; // Bao gồm user bên trong customer
      };
    };
    owner: true;
    homestay: true;
    booking: true;
    helpfulReviews: true;
    reviewReports: true;
  };
}>;

export type ReviewAllWithFlags = ReviewAll & {
  isHelpful?: boolean;
  isReported?: boolean;
};


// New Host Registration Types
export interface HostRegistration {
  id: string
  userId?: string
  fullName: string
  email: string
  phone: string
  homestayAddress: string
  experience?: string
  registrationStep: "info" | "payment" | "verification" | "approved" | "rejected"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  setupFeeAmount: number
  paymentMethod?: string
  packageType: "basic" | "premium" | "enterprise"
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedReason?: string
}

export interface HostPayment {
  id: string
  registrationId: string
  amount: number
  currency: string
  paymentMethod: string
  paymentIntentId?: string
  status: "pending" | "succeeded" | "failed" | "canceled"
  createdAt: string
  metadata?: Record<string, any>
}

export interface HostPackage {
  id: string
  name: string
  price: number
  commission: number
  features: string[]
  popular?: boolean
}
