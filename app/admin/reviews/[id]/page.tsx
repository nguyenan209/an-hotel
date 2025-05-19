"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, MessageSquare, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface ReviewDetailPageProps {
  params: {
    id: string;
  };
}

export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const [status, setStatus] = useState("published");
  const [ownerResponse, setOwnerResponse] = useState(
    "Thank you for your feedback! We're glad you enjoyed your stay and hope to welcome you back soon."
  );
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for the review
  const review = {
    id: params.id,
    homestayId: "hs1",
    homestayName: "Sunset Beach Villa",
    homestayImage: "/images/sunset-beach-villa-1.png",
    customerId: "cust1",
    customerName: "Lê Minh",
    customerEmail: "leminh@example.com",
    rating: 5,
    comment:
      "Tuyệt vời! Phòng sạch sẽ, view đẹp, chủ nhà thân thiện. Tôi đã có một kỳ nghỉ tuyệt vời tại đây. Đặc biệt ấn tượng với dịch vụ và sự tiện nghi của homestay. Chắc chắn sẽ quay lại vào lần sau.",
    images: [
      "/images/sunset-beach-villa-1.png",
      "/images/sunset-beach-villa-2.png",
    ],
    status: "published",
    createdAt: "2023-06-15T10:30:00Z",
    bookingId: "book123",
    checkIn: "2023-06-01",
    checkOut: "2023-06-05",
    ownerResponse:
      "Thank you for your feedback! We're glad you enjoyed your stay and hope to welcome you back soon.",
    ownerResponseDate: "2023-06-16T09:45:00Z",
  };

  const handleApprove = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to approve the review
    setTimeout(() => {
      setStatus("published");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleFlag = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to flag the review
    setTimeout(() => {
      setStatus("flagged");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleRemove = () => {
    if (
      confirm(
        "Are you sure you want to remove this review? This action cannot be undone."
      )
    ) {
      setIsSubmitting(true);
      // In a real app, you would call an API to remove the review
      setTimeout(() => {
        // Redirect to reviews page
        window.location.href = "/admin/reviews";
      }, 1000);
    }
  };

  const handleSaveResponse = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to save the owner response
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Response saved successfully");
    }, 1000);
  };

  const handleSaveNote = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to save the admin note
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Note saved successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/reviews">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Details</h2>
          <p className="text-muted-foreground">
            Review for{" "}
            <Link
              href={`/admin/homestays/${review.homestayId}`}
              className="text-blue-600 hover:underline"
            >
              {review.homestayName}
            </Link>{" "}
            by{" "}
            <Link
              href={`/admin/customers/${review.customerId}`}
              className="text-blue-600 hover:underline"
            >
              {review.customerName}
            </Link>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            className={
              status === "published"
                ? "bg-green-100 text-green-800"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Content</CardTitle>
              <CardDescription>
                Review submitted on {formatDate(review.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">{review.rating}/5</span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Comment
                </h3>
                <p className="text-base mt-1">{review.comment}</p>
              </div>

              {review.images && review.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-md border"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Stay Information
                </h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Booking ID</p>
                    <p className="text-sm">{review.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stay Period</p>
                    <p className="text-sm">
                      {review.checkIn} to {review.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner Response</CardTitle>
              <CardDescription>
                Response from the homestay owner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.ownerResponse ? (
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Responded on {formatDate(review.ownerResponseDate)}
                      </p>
                      <p className="text-base">{review.ownerResponse}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No response from the owner yet.
                </p>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Edit Owner Response</h3>
                <Textarea
                  placeholder="Enter owner's response..."
                  value={ownerResponse}
                  onChange={(e) => setOwnerResponse(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveResponse} disabled={isSubmitting}>
                    Save Response
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
              <CardDescription>
                Internal notes about this review (not visible to customers)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add internal notes about this review..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveNote} disabled={isSubmitting}>
                  Save Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Homestay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative overflow-hidden rounded-md">
                <Image
                  src={review.homestayImage || "/placeholder.svg"}
                  alt={review.homestayName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">{review.homestayName}</h3>
              <Link href={`/admin/homestays/${review.homestayId}`}>
                <Button variant="outline" className="w-full">
                  View Homestay
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-base font-medium">{review.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-base">{review.customerEmail}</p>
                </div>
              </div>
              <Link href={`/admin/customers/${review.customerId}`}>
                <Button variant="outline" className="w-full">
                  View Customer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {status === "pending" && (
                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Review
                </Button>
              )}
              {status !== "flagged" && (
                <Button
                  variant="outline"
                  className="w-full border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  onClick={handleFlag}
                  disabled={isSubmitting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" x2="4" y1="22" y2="15" />
                  </svg>
                  Flag Review
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                onClick={handleRemove}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
