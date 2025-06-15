"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CheckCircle, Eye, Filter, Search, Star, Trash, X } from "lucide-react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

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
import { AdminReviewsResponse } from "@/lib/types";
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
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

const PAGE_SIZE = 10;

// Thêm hàm helper để cắt ngắn HTML
function truncateHtml(html: string, maxLength: number) {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  if (text.length <= maxLength) return html;
  return text.substring(0, maxLength) + "...";
}

export default function ReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homestayToDelete, setHomestayToDelete] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce logic
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedSearchQuery(query);
      }, 300),
    []
  );

  // React Query infinite fetch
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "owner-reviews",
      debouncedSearchQuery,
      statusFilter,
      ratingFilter,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const pageNumber = typeof pageParam === "number" ? pageParam : 0;
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        status: statusFilter,
        rating: ratingFilter,
        skip: (pageNumber * PAGE_SIZE).toString(),
        limit: PAGE_SIZE.toString(),
      });
      const res = await fetch(`/api/owner/reviews?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.hasMore ? allPages.length : undefined;
    },
    enabled: !!user && !authLoading,
    initialPageParam: 0,
  });

  const reviews = useMemo(() => {
    const all = data?.pages.flatMap((page: any) => page.reviews) || [];
    const unique: Record<string, AdminReviewsResponse> = {};
    all.forEach((r: AdminReviewsResponse) => {
      unique[r.id] = r;
    });
    return Object.values(unique);
  }, [data]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/owner/reviews`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId: id, status: "APPROVED" }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve review");
      }
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve review");
    }
  };

  const handleFlag = async (id: string) => {
    try {
      const response = await fetch(`/api/owner/reviews`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId: id, status: "REJECTED" }),
      });
      if (!response.ok) {
        throw new Error("Failed to flag review");
      }
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to flag review");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/owner/reviews`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId: id }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove review");
      }
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove review");
    } finally {
      setDeleteDialogOpen(false);
      setHomestayToDelete(null);
    }
  };

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
            Manage and moderate customer reviews for all homestays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={handleSearchChange}
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
                  {reviews.map((review: AdminReviewsResponse) => (
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
                        <Link
                          href={`/owner/customers/${review.customerId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.customer.user.name} (
                          {review.customer.user.email})
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">{review.rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <div
                          className="text-sm line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: truncateHtml(review.comment || "", 150),
                          }}
                        />
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
                          <Link href={`/owner/reviews/${review.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </Link>
                          {review.status === ReviewStatus.PENDING && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleApprove(review.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                          )}
                          {review.status !== ReviewStatus.REJECTED && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-yellow-600"
                              onClick={() => handleFlag(review.id)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Rejected</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => {
                              setHomestayToDelete(review.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
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
      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHomestayToDelete(null);
        }}
        onConfirm={() => homestayToDelete && handleRemove(homestayToDelete)}
        itemName="this homestay"
        isDeleting={false}
      />
    </div>
  );
}
