"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Phone,
  CreditCard,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock booking data - in a real app, this would come from an API
const mockBookings = [
  {
    id: "b1",
    homestayId: "1",
    homestayName: "Sunset Beach Villa",
    roomName: "Deluxe Ocean View Suite",
    checkIn: "2025-06-01",
    checkOut: "2025-06-05",
    guests: 2,
    totalPrice: 1200,
    status: "upcoming",
    location: "Bali, Indonesia",
    image: "/images/sunset-beach-villa-room-1.png",
    bookingDate: "2025-03-15",
    bookingId: "BK-2025-0315-001",
    hostName: "Sarah Johnson",
    hostPhone: "+1 (555) 123-4567",
    paymentMethod: "Credit Card",
    amenities: [
      "Ocean View",
      "King Bed",
      "Private Balcony",
      "Air Conditioning",
      "Free WiFi",
    ],
    cancellationPolicy:
      "Free cancellation up to 7 days before check-in. After that, 50% of the total amount will be charged.",
  },
  {
    id: "b2",
    homestayId: "2",
    homestayName: "Mountain Retreat",
    roomName: "Cozy Fireplace Room",
    checkIn: "2025-05-15",
    checkOut: "2025-05-18",
    guests: 2,
    totalPrice: 750,
    status: "completed",
    location: "Sapa, Vietnam",
    image: "/images/mountain-retreat-room-1.png",
    bookingDate: "2025-02-20",
    bookingId: "BK-2025-0220-003",
    hostName: "Michael Chen",
    hostPhone: "+84 (123) 456-7890",
    paymentMethod: "PayPal",
    amenities: [
      "Mountain View",
      "Fireplace",
      "Queen Bed",
      "Heating",
      "Free WiFi",
    ],
    cancellationPolicy:
      "Free cancellation up to 5 days before check-in. After that, 70% of the total amount will be charged.",
  },
  {
    id: "b3",
    homestayId: "3",
    homestayName: "Riverside Cottage",
    roomName: "Riverside Suite",
    checkIn: "2025-07-10",
    checkOut: "2025-07-15",
    guests: 3,
    totalPrice: 950,
    status: "upcoming",
    location: "Hoi An, Vietnam",
    image: "/images/riverside-cottage-room-1.png",
    bookingDate: "2025-04-05",
    bookingId: "BK-2025-0405-007",
    hostName: "Linh Nguyen",
    hostPhone: "+84 (987) 654-3210",
    paymentMethod: "Bank Transfer",
    amenities: [
      "River View",
      "King Bed",
      "Private Terrace",
      "Air Conditioning",
      "Free WiFi",
    ],
    cancellationPolicy:
      "Free cancellation up to 10 days before check-in. After that, 60% of the total amount will be charged.",
  },
];

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        const foundBooking = mockBookings.find((b) => b.id === params.id);

        if (foundBooking) {
          setBooking(foundBooking);
        } else {
          // Handle booking not found
          console.error("Booking not found");
        }
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      // In a real app, this would be an API call to cancel the booking
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to bookings page after successful cancellation
      router.push("/bookings");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="mb-6">
            Sorry, we couldn't find the booking you're looking for.
          </p>
          <Button onClick={() => router.push("/bookings")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/bookings")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <div className="ml-auto">{getStatusBadge(booking.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Booking Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {booking.homestayName}
                  </CardTitle>
                  <CardDescription className="text-lg mt-1">
                    {booking.roomName}
                  </CardDescription>
                </div>
                <div className="mt-2 md:mt-0">
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">{booking.bookingId}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video relative overflow-hidden rounded-md">
                <img
                  src={booking.image || "/placeholder.svg"}
                  alt={booking.homestayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Check-in / Check-out
                    </h3>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <span>
                        {formatDate(booking.checkIn)} -{" "}
                        {formatDate(booking.checkOut)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span>
                        {calculateNights(booking.checkIn, booking.checkOut)}{" "}
                        nights
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500">Guests</h3>
                    <div className="flex items-center mt-1">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span>
                        {booking.guests}{" "}
                        {booking.guests > 1 ? "guests" : "guest"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500">Location</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{booking.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Host</h3>
                    <div className="flex items-center mt-1">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{booking.hostName}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{booking.hostPhone}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500">Payment</h3>
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{booking.paymentMethod}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Booked on {formatDate(booking.bookingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-500 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {booking.amenities.map((amenity: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-100"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>
                  Room rate (
                  {calculateNights(booking.checkIn, booking.checkOut)} nights)
                </span>
                <span>${booking.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & fees</span>
                <span>Included</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>${booking.totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {booking.status === "upcoming" && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  Cancel Booking
                </Button>
              )}
              <ContactHostButton hostPhone={booking.hostPhone} />
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{booking.cancellationPolicy}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking at{" "}
              {booking.homestayName}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Cancellation Policy
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>{booking.cancellationPolicy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContactHostButton({ hostPhone }: { hostPhone: string }) {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={() => setShowPhone(!showPhone)}
    >
      {showPhone ? (
        <span className="flex items-center">
          <Phone className="mr-2 h-4 w-4" /> {hostPhone}
        </span>
      ) : (
        <span className="flex items-center">
          <MessageSquare className="mr-2 h-4 w-4" /> Contact Host
        </span>
      )}
    </Button>
  );
}
