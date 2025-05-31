"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
    setIsLoading(skip === 0);
    setIsLoadingMore(skip > 0);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/reviews?search=${searchQuery}&status=${statusFilter}&rating=${ratingFilter}&skip=${skip}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      setReviews((prev) =>
        append ? [...prev, ...data.reviews] : data.reviews
      );
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [debouncedSearchQuery, statusFilter, ratingFilter]);


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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No reviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchReviews(reviews.length, true)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
