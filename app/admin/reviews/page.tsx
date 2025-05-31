"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { CheckCircle, Eye, Filter, Search, Star, X } from "lucide-react";

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

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<AdminReviewsResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce logic
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedSearchQuery(query);
      }, 300), // Delay 300ms
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const fetchReviews = async (skip = 0, append = false) => {
    try {
      const response = await fetch(
        `/api/admin/reviews?search=${debouncedSearchQuery}&status=${statusFilter}&rating=${ratingFilter}&skip=${skip}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews((prev) => {
        if (!append) {
          // Khi append = false, thay thế toàn bộ danh sách reviews
          return data.reviews;
        }

        // Khi append = true, thêm các bản ghi mới vào danh sách hiện tại
        const reviewIds = new Set(prev.map((review) => review.id));
        const uniqueReviews = data.reviews.filter(
          (review: AdminReviewsResponse) => !reviewIds.has(review.id)
        );

        return [...prev, ...uniqueReviews];
      });
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews");
    }
  };

  useEffect(() => {
    const fetchWithDebounce = async () => {
      console.log("Debounced Search Query:", debouncedSearchQuery);
      // Xóa danh sách reviews trước khi gọi API mới
      setReviews([]);
      setHasMore(true);
      await fetchReviews(0, false);
    };

    fetchWithDebounce();
  }, [debouncedSearchQuery, statusFilter, ratingFilter]);

  const loadMoreReviews = async () => {
    if (!hasMore) return;

    const nextSkip = reviews.length;
    await fetchReviews(nextSkip, true); // Gọi API với skip = reviews.length và append = true
  };
  useEffect(() => {
    console.log("Reviews State:", reviews);
  }, [reviews]);

  const handleApprove = async (id: string) => {
    // Call API to approve review
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: "published" } : review
      )
    );
  };

  const handleFlag = async (id: string) => {
    // Call API to flag review
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: "flagged" } : review
      )
    );
  };

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to remove this review?")) {
      // Call API to remove review
      setReviews(reviews.filter((review) => review.id !== id));
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
              next={loadMoreReviews}
              hasMore={hasMore}
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
                          href={`/admin/homestays/${review.homestayId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.homestay.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/customers/${review.customerId}`}
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
                        {review.comment}
                      </TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            review.status === "published"
                              ? "bg-green-100 text-green-800"
                              : review.status === "pending"
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
                          <Link href={`/admin/reviews/${review.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </Link>
                          {review.status === "pending" && (
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
                          {review.status !== "flagged" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-yellow-600"
                              onClick={() => handleFlag(review.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" x2="4" y1="22" y2="15" />
                              </svg>
                              <span className="sr-only">Flag</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => handleRemove(review.id)}
                          >
                            <X className="h-4 w-4" />
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
    </div>
  );
}
