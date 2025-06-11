"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
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
  Star,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStatusBadge } from "@/components/booking/status-badge";
import { AdminReviewsResponse, BookingWithHomestay } from "@/lib/types";
import { calculateNights, CANCELLATION_POLICIES } from "@/lib/utils";
import moment from "moment";
import { BookingStatus } from "@prisma/client";
import Loading from "@/components/loading";
import { ReviewSection } from "@/components/review/review-section";
import { ReviewForm } from "@/components/review/review-form";
import { ComplaintForm } from "@/components/complaint/complaint-form";
import { useAuth } from "@/context/AuthContext";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithHomestay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [userReview, setUserReview] = useState<AdminReviewsResponse | null>(
    null
  ); // Lưu review của người dùng
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const [hasComplaint, setHasComplaint] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${params.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setBooking(data);

        // Fetch review của người dùng cho homestay này
        const reviewResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/review?homestayId=${data.homestayId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();

          setUserReview(reviewData); // Lưu review nếu trạng thái là APPROVED
          setHasReviewed(true);
        }
      } catch (error) {
        console.error("Failed to fetch booking or review details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id]);

  useEffect(() => {
    const checkComplaint = async () => {
      if (!isLoggedIn || !user?.customerId || !booking) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints?bookingId=${booking.id}&customerId=${user.customerId}`);
        if (res.ok) {
          const data = await res.json();
          setHasComplaint(data.complaints && data.complaints.length > 0);
        }
      } catch (e) {
        // ignore
      }
    };
    checkComplaint();
  }, [isLoggedIn, user, booking]);

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
    return <Loading />;
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
                    {booking.homestay.name}
                  </CardTitle>
                  <CardDescription className="text-lg mt-1">
                    Booked at{" "}
                    {moment(booking.createdAt).format("MMMM Do YYYY, h:mm A")}
                  </CardDescription>
                </div>
                <div className="mt-2 md:mt-0">
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">{booking.bookingNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video relative overflow-hidden rounded-md">
                <img
                  src={booking.homestay.images[0] || "/placeholder.svg"}
                  alt={booking.homestay.name}
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
                        {moment(booking.checkIn).format("MMMM Do YYYY")} -{" "}
                        {moment(booking.checkOut).format("MMMM Do YYYY")}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span>
                        {calculateNights(
                          booking.checkIn.toString(),
                          booking.checkOut.toString()
                        )}{" "}
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
                      <span>{booking.homestay.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Host</h3>
                    <div className="flex items-center mt-1">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{booking.homestay.owner.name}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{booking.homestay.owner.phone}</span>
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
                      <span>
                        {" "}
                        Booked on{" "}
                        {moment(booking.createdAt).format(
                          "MMMM Do YYYY, h:mm A"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-500 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {booking.homestay.amenities.map(
                    (amenity: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-100"
                      >
                        {amenity}
                      </Badge>
                    )
                  )}
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
                  {calculateNights(
                    booking.checkIn.toString(),
                    booking.checkOut.toString()
                  )}{" "}
                  nights)
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
              {booking.status === BookingStatus.UPCOMING && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  Cancel Booking
                </Button>
              )}
              <ContactHostButton
                hostPhone={booking.homestay.owner.phone || ""}
              />
              {booking && (hasComplaint ? (
                <Button variant="outline" className="w-full flex items-center" disabled>
                  <AlertCircle className="mr-2 h-4 w-4" /> Đã gửi khiếu nại
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full flex items-center"
                  onClick={() => setIsComplaintDialogOpen(true)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" /> Report an Issue
                </Button>
              ))}
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{CANCELLATION_POLICIES}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Review Section - Only show for completed bookings */}
      {booking.status === BookingStatus.COMPLETED && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Star className="h-6 w-6 mr-2 text-yellow-400" />
            Share Your Experience
          </h2>
          <ReviewForm
            bookingId={booking.id}
            homestayId={booking.homestayId}
            homestayName={booking.homestay.name}
          />
        </div>
      )}

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
              {booking.homestay.name}?
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
                    <p>{CANCELLATION_POLICIES}</p>
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
      
            {/* Complaint Dialog */}
            <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Report an Issue
            </DialogTitle>
            <DialogDescription>
              Please provide details about the issue you're experiencing with your booking.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-y-auto flex-1">
            <ComplaintForm
              bookingId={booking.id}
              bookingInfo={{
                id: booking.id,
                homestayName: booking.homestay.name,
                checkIn: new Date(booking.checkIn).toISOString(),
                checkOut: new Date(booking.checkOut).toISOString(),
              }}
            />
          </div>
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
