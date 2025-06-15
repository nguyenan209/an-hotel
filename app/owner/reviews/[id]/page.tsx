"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, MessageSquare, Star, Trash, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import moment from "moment";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/loading";
import { ReviewStatus } from "@prisma/client";

const TinyMCEEditor = dynamic(() => import("@/components/tinymce-editor"), { ssr: false });

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: review,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["owner-review-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/owner/reviews/${id}`);
      if (!res.ok) throw new Error("Failed to fetch review");
      return res.json();
    },
    enabled: !!id,
  });
  const [status, setStatus] = useState("");
  const [ownerResponse, setOwnerResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [tempOwnerResponse, setTempOwnerResponse] = useState("");

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/owner/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, status: "APPROVED" }),
      });
      if (!res.ok) throw new Error("Failed to approve review");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Review approved successfully.");
      refetch();
    },
    onError: () => toast.error("Failed to approve review."),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/owner/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, status: "REJECTED" }),
      });
      if (!res.ok) throw new Error("Failed to reject review");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Review rejected successfully.");
      refetch();
    },
    onError: () => toast.error("Failed to reject review."),
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/owner/reviews`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id }),
      });
      if (!res.ok) throw new Error("Failed to remove review");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Review removed successfully.");
      window.location.href = "/owner/reviews";
    },
    onError: () => toast.error("Failed to remove review."),
  });

  const saveResponseMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/owner/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, ownerReply: content }),
      });
      if (!res.ok) throw new Error("Failed to save owner's response");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Owner's response saved successfully.");
      setIsEditingResponse(false);
      refetch();
    },
    onError: () => toast.error("Failed to save owner's response."),
  });

  const deleteResponseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/owner/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, ownerReply: null }),
      });
      if (!res.ok) throw new Error("Failed to delete owner's response");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Owner's response deleted successfully.");
      setDeleteDialogOpen(false);
      refetch();
    },
    onError: () => toast.error("Failed to delete owner's response."),
  });

  useEffect(() => {
    if (review) {
      setStatus(review.status);
      setOwnerResponse(review.ownerReply || "");
    }
  }, [review]);

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-red-500">Error: {(error as Error).message}</div>;
  if (!review) return <div>Review not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/owner/reviews">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Details</h2>
          <p className="text-muted-foreground">
            Review for{" "}
            <Link
              href={`/owner/homestays/${review.homestayId}`}
              className="text-blue-600 hover:underline"
            >
              {review.homestay.name}
            </Link>{" "}
            by{" "}
            <Link
              href={`/owner/customers/${review.customerId}`}
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
                <div className="text-base mt-1" dangerouslySetInnerHTML={{ __html: review.comment }} />
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
                            <div
                              className="text-base"
                              dangerouslySetInnerHTML={{
                                __html: ownerResponse,
                              }}
                            />
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
                            <TinyMCEEditor
                              apiKey={
                                process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""
                              }
                              value={tempOwnerResponse}
                              onChange={(content) =>
                                setTempOwnerResponse(content)
                              }
                              height={500}
                              folder="reviews"
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
                            setOwnerResponse(tempOwnerResponse);
                            saveResponseMutation.mutate(tempOwnerResponse);
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
                      <TinyMCEEditor
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""}
                        value={tempOwnerResponse}
                        onChange={(content) => setTempOwnerResponse(content)}
                        height={300}
                        folder="reviews"
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
                          size="sm"
                          onClick={() => {
                            setOwnerResponse(tempOwnerResponse);
                            saveResponseMutation.mutate(tempOwnerResponse);
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
              <Link href={`/owner/homestays/${review.homestayId}`}>
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
              <Link href={`/owner/customers/${review.customerId}`}>
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
              {status === ReviewStatus.PENDING && (
                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={() => approveMutation.mutate()}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Review
                </Button>
              )}
              {status !== ReviewStatus.REJECTED && (
                <Button
                  variant="outline"
                  className="w-full border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => rejectMutation.mutate()}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject Review
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                onClick={() => removeMutation.mutate()}
                disabled={isSubmitting}
              >
                <Trash className="mr-2 h-4 w-4" />
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
        onConfirm={() => deleteResponseMutation.mutate()}
        itemName="this response"
        isDeleting={isSubmitting}
      />
    </div>
  );
}
