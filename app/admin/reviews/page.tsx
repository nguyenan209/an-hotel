"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { CheckCircle, Eye, Filter, Search, Star, Trash, X } from "lucide-react";

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

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<AdminReviewsResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homestayToDelete, setHomestayToDelete] = useState<string | null>(null);

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
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve review");
      }

      const data = await response.json();

      // Cập nhật trạng thái review trong state
      setReviews(
        reviews.map((review) =>
          review.id === id ? { ...review, status: data.data.status } : review
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to approve review");
    }
  };

  const handleFlag = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to flag review");
      }

      const data = await response.json();

      // Cập nhật trạng thái review trong state
      setReviews(
        reviews.map((review) =>
          review.id === id ? { ...review, status: data.data.status } : review
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to flag review");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove review");
      }

      // Xóa review khỏi state
      setReviews(reviews.filter((review) => review.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove review");
    } finally {
      setDeleteDialogOpen(false);
      setHomestayToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Đánh giá</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | ReviewStatus)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={ReviewStatus.APPROVED}>
                Đã phê duyệt
              </SelectItem>
              <SelectItem value={ReviewStatus.PENDING}>
                Chờ phê duyệt
              </SelectItem>
              <SelectItem value={ReviewStatus.REJECTED}>Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đánh giá</SelectItem>
              <SelectItem value="positive">Tích cực (4-5★)</SelectItem>
              <SelectItem value="negative">Tiêu cực (1-2★)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6 mt-5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đánh giá..."
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
              loader={<p className="text-center py-4">Đang tải...</p>}
              endMessage={
                <p className="text-center py-4 text-muted-foreground">
                  Không còn đánh giá để tải thêm.
                </p>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Bình luận</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
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
                        <div
                          dangerouslySetInnerHTML={{ __html: review.comment }}
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
                          <Link href={`/admin/reviews/${review.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Xem</span>
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
                              <span className="sr-only">Phê duyệt</span>
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
                              <span className="sr-only">Từ chối</span>
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
                            <span className="sr-only">Xóa</span>
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
