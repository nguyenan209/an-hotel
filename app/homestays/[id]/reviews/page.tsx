"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import { ReviewResponse } from "@/lib/types";
import { StarRating } from "@/components/star-rating";
import { ReviewCard } from "@/components/review/review-card";
import { ReportDialog } from "@/components/review/report-dialog";

export default function ReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [homestayName, setHomestayName] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [reportingReview, setReportingReview] = useState<ReviewResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const homestayResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/homestays/${id}`
        );
        if (homestayResponse.ok) {
          const homestayData = await homestayResponse.json();
          setHomestayName(homestayData.name);
        }

        const reviewsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reviews?homestayId=${id}`
        );
        if (!reviewsResponse.ok) {
          throw new Error("Không thể tải đánh giá");
        }
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews);
        setFilteredReviews(reviewsData.reviews);
        setHelpfulReviews(
          reviewsData.reviews
            .filter((review: any) => review.isHelpful)
            .map((r: any) => r.id)
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Đã xảy ra lỗi khi tải đánh giá");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let filtered = [...reviews];

    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter);
      filtered = filtered.filter((review) => review.rating === rating);
    }

    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime()
        );
        break;
      case "highest":
        filtered.sort((a, b) => b.rating! - a.rating!);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating! - b.rating!);
        break;
      case "helpful":
        filtered.sort((a, b) => b.helpfulCount! - a.helpfulCount!);
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, ratingFilter, sortBy]);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, sortBy]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return "0";
    const sum = reviews.reduce((acc, review) => acc + review.rating!, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();

  const handleHelpfulClick = async (review: ReviewResponse) => {
    const isAlreadyHelpful = helpfulReviews.includes(review.id);

    try {
      const response = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: review.id,
          isHelpful: !isAlreadyHelpful,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái hữu ích");
      }

      const updatedReview = await response.json();

      // Cập nhật state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, helpfulCount: updatedReview.review.helpfulCount }
            : r
        )
      );

      setHelpfulReviews((prev) =>
        isAlreadyHelpful
          ? prev.filter((id) => id !== review.id)
          : [...prev, review.id]
      );

      toast({
        title: isAlreadyHelpful
          ? "Đã bỏ đánh dấu hữu ích"
          : "Đã đánh dấu hữu ích",
        description: isAlreadyHelpful
          ? "Bạn đã bỏ đánh dấu đánh giá này là hữu ích."
          : "Cảm ơn bạn đã đánh dấu đánh giá này là hữu ích.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating helpful status:", error);
      toast({
        title: "Không thể cập nhật trạng thái hữu ích",
        description: "Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href={`/homestays/${id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Đánh giá của khách</h1>
        <p className="text-muted-foreground">{homestayName}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tổng quan đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {calculateAverageRating()}
              </div>
              <div className="flex justify-center mb-2">
                <StarRating
                  rating={Math.round(
                    Number.parseFloat(calculateAverageRating())
                  )}
                />
              </div>
              <p className="text-muted-foreground">{reviews.length} đánh giá</p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating} sao</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          reviews.length > 0
                            ? (ratingDistribution[
                                rating as keyof typeof ratingDistribution
                              ] /
                                reviews.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">
                    {
                      ratingDistribution[
                        rating as keyof typeof ratingDistribution
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Lọc:</span>
        </div>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tất cả đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đánh giá</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4 sao</SelectItem>
            <SelectItem value="3">3 sao</SelectItem>
            <SelectItem value="2">2 sao</SelectItem>
            <SelectItem value="1">1 sao</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="highest">Điểm cao nhất</SelectItem>
            <SelectItem value="lowest">Điểm thấp nhất</SelectItem>
            <SelectItem value="helpful">Hữu ích nhất</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="ml-auto">
          {filteredReviews.length} kết quả
        </Badge>
      </div>

      <div className="space-y-6">
        {currentReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <StarRating rating={0} className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Không có đánh giá nào
              </h3>
              <p className="text-gray-500 text-center">
                Không tìm thấy đánh giá nào phù hợp với bộ lọc của bạn.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isHelpful={helpfulReviews.includes(review.id!)}
                onHelpfulClick={() => handleHelpfulClick(review)}
                onReportClick={(review) => setReportingReview(review)}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {indexOfFirstReview + 1}-
                  {Math.min(indexOfLastReview, filteredReviews.length)} trong
                  tổng số {filteredReviews.length} đánh giá
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              className="w-10"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 text-muted-foreground"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ReportDialog
        open={!!reportingReview}
        onOpenChange={(open) => !open && setReportingReview(null)}
        review={reportingReview}
        onSubmit={async (reason, details) => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({
              title: "Báo cáo đã được gửi",
              description:
                "Cảm ơn bạn đã gửi báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.",
            });
            setReportingReview(null);
          } catch (error) {
            toast({
              title: "Không thể gửi báo cáo",
              description:
                "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}
