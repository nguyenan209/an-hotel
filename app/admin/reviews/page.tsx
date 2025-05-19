"use client";

import { useState } from "react";
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

// Mock data for reviews
const mockReviews = [
  {
    id: "rev1",
    homestayId: "hs1",
    homestayName: "Sunset Beach Villa",
    customerId: "cust1",
    customerName: "Lê Minh",
    rating: 5,
    comment: "Tuyệt vời! Phòng sạch sẽ, view đẹp, chủ nhà thân thiện.",
    status: "published",
    createdAt: "2023-06-15T10:30:00Z",
    hasResponse: true,
  },
  {
    id: "rev2",
    homestayId: "hs2",
    homestayName: "Mountain Retreat Lodge",
    customerId: "cust2",
    customerName: "Trần Hoa",
    rating: 4,
    comment: "Phòng đẹp, view núi tuyệt vời. Chỉ tiếc là hơi xa trung tâm.",
    status: "published",
    createdAt: "2023-06-16T14:20:00Z",
    hasResponse: false,
  },
  {
    id: "rev3",
    homestayId: "hs3",
    homestayName: "Riverside Cottage",
    customerId: "cust3",
    customerName: "Nguyễn Thành",
    rating: 2,
    comment: "Phòng không được sạch lắm, dịch vụ chưa tốt.",
    status: "pending",
    createdAt: "2023-06-17T09:15:00Z",
    hasResponse: false,
  },
  {
    id: "rev4",
    homestayId: "hs4",
    homestayName: "City Center Apartment",
    customerId: "cust4",
    customerName: "Phạm Linh",
    rating: 5,
    comment: "Vị trí trung tâm, tiện nghi đầy đủ, giá cả hợp lý.",
    status: "published",
    createdAt: "2023-06-18T11:45:00Z",
    hasResponse: true,
  },
  {
    id: "rev5",
    homestayId: "hs5",
    homestayName: "Lakeside Villa",
    customerId: "cust5",
    customerName: "Hoàng Nam",
    rating: 1,
    comment: "Thất vọng với dịch vụ, phòng không như hình ảnh quảng cáo.",
    status: "flagged",
    createdAt: "2023-06-19T16:30:00Z",
    hasResponse: true,
  },
];

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState(mockReviews);

  // Filter reviews based on search query, status filter, and rating filter
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.homestayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "positive" && review.rating >= 4) ||
      (ratingFilter === "negative" && review.rating <= 2);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleApprove = (id: string) => {
    // In a real app, you would call an API to approve the review
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: "published" } : review
      )
    );
  };

  const handleFlag = (id: string) => {
    // In a real app, you would call an API to flag the review
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: "flagged" } : review
      )
    );
  };

  const handleRemove = (id: string) => {
    // In a real app, you would call an API to remove the review
    if (confirm("Are you sure you want to remove this review?")) {
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="positive">Positive (4-5★)</SelectItem>
              <SelectItem value="neutral">Neutral (3★)</SelectItem>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-normal">
                {filteredReviews.filter((r) => r.status === "pending").length}{" "}
                Pending
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 text-sm font-normal"
              >
                {filteredReviews.filter((r) => r.status === "published").length}{" "}
                Published
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 text-sm font-normal"
              >
                {filteredReviews.filter((r) => r.status === "flagged").length}{" "}
                Flagged
              </Badge>
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
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No reviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Link
                          href={`/admin/homestays/${review.homestayId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.homestayName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/customers/${review.customerId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.customerName}
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
        </CardContent>
      </Card>
    </div>
  );
}
