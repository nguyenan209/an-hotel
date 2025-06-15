"use client";

import { useState } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { CheckCircle, Eye, Filter, Search, Star, Trash, X } from "lucide-react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ReviewStatus } from "@prisma/client";
import { debounce } from "lodash";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Review {
  id: string;
  homestayId: string;
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
      phone: string;
    };
  };
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  ownerReply: string | null;
  ownerReplyDate: string | null;
}

interface ReviewsResponse {
  reviews: Review[];
  hasMore: boolean;
}

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<ReviewsResponse>({
    queryKey: ["owner-reviews", searchQuery, statusFilter, ratingFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/owner/reviews?search=${searchQuery}&status=${statusFilter}&rating=${ratingFilter}&skip=${pageParam}&limit=10`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined;
      return pages.length * 10;
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, ownerReply }: { reviewId: string; ownerReply: string }) => {
      const response = await fetch("/api/owner/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, ownerReply }),
      });
      if (!response.ok) {
        throw new Error("Failed to update review");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-reviews"] });
      setReplyDialogOpen(false);
      setSelectedReview(null);
      setReplyText("");
    },
  });

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.ownerReply || "");
    setReplyDialogOpen(true);
  };

  const handleSubmitReply = () => {
    if (selectedReview) {
      updateReviewMutation.mutate({
        reviewId: selectedReview.id,
        ownerReply: replyText,
      });
    }
  };

  const reviews = data?.pages.flatMap((page) => page.reviews) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Review Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | ReviewStatus)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={ReviewStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={ReviewStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={ReviewStatus.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="positive">Positive (4-5★)</SelectItem>
              <SelectItem value="negative">Negative (1-2★)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            Manage and respond to customer reviews for your homestays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <InfiniteScroll
              dataLength={reviews.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={<p className="text-center py-4">Loading...</p>}
              endMessage={
                <p className="text-center py-4 text-muted-foreground">
                  No more reviews to load.
                </p>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Link
                          href={`/owner/homestays/${review.homestayId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.homestay.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{review.customer.user.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {review.customer.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">{review.rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-2">
                          <div
                            dangerouslySetInnerHTML={{ __html: review.comment }}
                          />
                          {review.ownerReply && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <strong>Your reply:</strong> {review.ownerReply}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            review.status === ReviewStatus.APPROVED
                              ? "bg-green-100 text-green-800"
                              : review.status === ReviewStatus.PENDING
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {review.status.charAt(0).toUpperCase() +
                            review.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReply(review)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Reply</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          </div>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Customer Review:</h4>
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: selectedReview?.comment || "",
                }}
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Reply:</h4>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply here..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReplyDialogOpen(false);
                  setSelectedReview(null);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={updateReviewMutation.isPending}
              >
                {updateReviewMutation.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
