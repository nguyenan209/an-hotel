"use client";

import { useEffect, useState } from "react";
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
import { useParams } from "next/navigation";
import { AdminReviewsResponse } from "@/lib/types";
import moment from "moment";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<AdminReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [ownerResponse, setOwnerResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [tempOwnerResponse, setTempOwnerResponse] = useState("");

  // Fetch review data from API
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`/api/admin/reviews/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch review");
        }
        const data = await response.json();
        setReview(data);
        setStatus(data.status);
        setOwnerResponse(data.ownerReply || "");
      } catch (err) {
        toast.error("Failed to fetch review details");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return <p>Loading review details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!review) {
    return <p>Review not found.</p>;
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "published" }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve review");
      }

      setStatus("published");
      toast.success("Review approved successfully.");
    } catch (err) {
      toast.error("Failed to approve review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlag = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "flagged" }),
      });

      if (!response.ok) {
        throw new Error("Failed to flag review");
      }

      setStatus("flagged");
      toast.success("Review flagged successfully.");
    } catch (err) {
      toast.error("Failed to flag review.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRemove = async () => {
    if (
      confirm(
        "Are you sure you want to remove this review? This action cannot be undone."
      )
    ) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/admin/reviews/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to remove review");
        }

        toast.success("Review removed successfully.");
        window.location.href = "/admin/reviews";
      } catch (err) {
        toast.error("Failed to remove review.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveResponse = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerReply: tempOwnerResponse }),
      });

      if (!response.ok) {
        throw new Error("Failed to save owner's response");
      }

      setIsEditingResponse(false);
      toast.success("Owner's response saved successfully.");
    } catch (err) {
      toast.error("Failed to save owner's response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResponse = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerReply: null }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete owner's response");
      }

      setOwnerResponse("");
      setDeleteDialogOpen(false);
      toast.success("Owner's response deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete owner's response.");
    } finally {
      setIsSubmitting(false);
    }
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
              {review.homestay.name}
            </Link>{" "}
            by{" "}
            <Link
              href={`/admin/customers/${review.customerId}`}
              className="text-blue-600 hover:underline"
            >
              {review.customer.user.name}
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
                      {moment(review.booking.checkIn).format("MMMM DD, YYYY")}{" "}
                      to{" "}
                      {moment(review.booking.checkOut).format("MMMM DD, YYYY")}
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
              {ownerResponse ? (
                <div className="space-y-4">
                  {!isEditingResponse ? (
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Responded on{" "}
                              {moment(review.ownerReplyDate).format(
                                "MMMM DD, YYYY hh:mm A"
                              )}
                            </p>
                            <p className="text-base">{ownerResponse}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTempOwnerResponse(ownerResponse); // Sao chép giá trị hiện tại
                            setIsEditingResponse(true);
                          }}
                        >
                          Edit Response
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          Delete Response
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <p className="text-sm text-muted-foreground">
                              Responded on{" "}
                              {moment(review.ownerReplyDate).format(
                                "MMMM DD, YYYY"
                              )}
                            </p>
                            <Textarea
                              value={tempOwnerResponse} // Sử dụng state tạm thời
                              onChange={(e) =>
                                setTempOwnerResponse(e.target.value)
                              } // Cập nhật state tạm thời
                              rows={4}
                              className="mt-2"
                              placeholder="Enter owner's response..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingResponse(false)} // Hủy chỉnh sửa
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setOwnerResponse(tempOwnerResponse); // Cập nhật state chính thức
                            handleSaveResponse();
                          }}
                          disabled={isSubmitting || !tempOwnerResponse.trim()}
                        >
                          Save Response
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!isAddingResponse ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">
                        No response from the owner yet.
                      </p>
                      <Button
                        onClick={() => {
                          setTempOwnerResponse(""); // Reset giá trị tạm thời
                          setIsAddingResponse(true);
                        }}
                      >
                        Add Response
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Add Owner Response
                      </h3>
                      <Textarea
                        placeholder="Enter owner's response..."
                        value={tempOwnerResponse} // Sử dụng state tạm thời
                        onChange={(e) => setTempOwnerResponse(e.target.value)} // Cập nhật state tạm thời
                        rows={4}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingResponse(false)} // Hủy thêm mới
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            setOwnerResponse(tempOwnerResponse); // Cập nhật state chính thức
                            handleSaveResponse();
                          }}
                          disabled={isSubmitting || !tempOwnerResponse.trim()}
                        >
                          Save Response
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  src={review.homestay.images[0] || "/placeholder.svg"}
                  alt={review.homestay.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">{review.homestay.name}</h3>
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
                  <p className="text-base font-medium">
                    {review.customer.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-base">{review.customer.user.email}</p>
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
      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteResponse}
        itemName="this response"
        isDeleting={isSubmitting}
      />
    </div>
  );
}
