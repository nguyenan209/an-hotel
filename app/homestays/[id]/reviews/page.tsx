"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useReviewStore } from "@/lib/store/reviewStore";
import { ReviewAll } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Filter, Flag, Star, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Define a type that extends ReviewAll with isHelpful and isReported
type ReviewWithFlags = ReviewAll & { isHelpful?: boolean; isReported?: boolean };

export default function ReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithFlags[]>([]);
  const [homestayName, setHomestayName] = useState("");

  // Filter states
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Report dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<ReviewAll | null>(
    null
  );
  const [reportReason, setReportReason] = useState<string>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const {
    reviews,
    isLoading,
    error,
    markHelpful,
    unmarkHelpful,
    updateHelpfulCount,
    fetchReviews,
    setError,
  } = useReviewStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch homestay info
        const homestayResponse = await fetch(`/api/homestays/${id}`);
        if (homestayResponse.ok) {
          const homestayData = await homestayResponse.json();
          setHomestayName(homestayData.name);
        }
        // Fetch reviews using store, pass filter/sort
        await fetchReviews(id, ratingFilter, sortBy);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Đã xảy ra lỗi khi tải đánh giá");
      }
    };
    fetchData();
  }, [id, fetchReviews, setError, ratingFilter, sortBy]);

  // Set filteredReviews directly from reviews
  useEffect(() => {
    setFilteredReviews(reviews as ReviewWithFlags[]);
  }, [reviews]);

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, sortBy]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const handleHelpfulClick = async (review: ReviewWithFlags) => {
    if (!isLoggedIn) {
      toast({
        title: "Bạn cần đăng nhập để đánh dấu hữu ích",
        description: "Vui lòng đăng nhập để sử dụng tính năng này.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHelpful: !review.isHelpful }),
      });
      if (!response.ok) throw new Error("Không thể cập nhật trạng thái hữu ích");
      const updated = await response.json();
      setFilteredReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, helpfulCount: updated.review.helpfulCount, isHelpful: !review.isHelpful }
            : r
        )
      );
      toast({
        title: !review.isHelpful ? "Đã đánh dấu hữu ích" : "Đã bỏ đánh dấu hữu ích",
        description: !review.isHelpful
          ? "Cảm ơn bạn đã đánh dấu đánh giá này là hữu ích."
          : "Bạn đã bỏ đánh dấu đánh giá này là hữu ích.",
      });
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleReportClick = (review: ReviewAll) => {
    setReportingReview(review);
    setReportReason("inappropriate");
    setReportDetails("");
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reportingReview) return;

    setIsSubmittingReport(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReportDialogOpen(false);
      toast({
        title: "Báo cáo đã được gửi",
        description:
          "Cảm ơn bạn đã gửi báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.",
      });
    } catch (error) {
      toast({
        title: "Không thể gửi báo cáo",
        description: "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
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

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
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
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {calculateAverageRating()}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(calculateAverageRating())}
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

      {/* Reviews List */}
      <div className="space-y-6">
        {currentReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-gray-300 mb-4" />
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
              <Card
                key={review.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            review.customer.user.avatar || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {review.customer.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {review.customer.user.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt!)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating!)}</div>
                      <Badge variant="outline">{review.rating}/5</Badge>
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Owner Response */}
                  <div className="ml-6 p-4 bg-gray-50 border-l-4 border-primary rounded-r-md mb-4">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/diverse-person-portrait.png" />
                        <AvatarFallback>CV</AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">
                            Nguyễn Văn Chủ
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            Chủ sở hữu
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Phản hồi:{" "}
                          {formatDate(
                            new Date(
                              new Date(review.createdAt!).getTime() +
                                86400000 * 3
                            ).toISOString()
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">
                      {review.rating! >= 4
                        ? "Cảm ơn bạn đã đánh giá tích cực về Homestay của chúng tôi! Chúng tôi rất vui khi biết bạn đã có trải nghiệm tuyệt vời. Mong được đón tiếp bạn trong những lần tới!"
                        : "Cảm ơn bạn đã chia sẻ phản hồi! Chúng tôi xin lỗi về những bất tiện bạn đã gặp phải. Chúng tôi sẽ cải thiện dịch vụ để mang đến trải nghiệm tốt hơn cho khách hàng trong tương lai. Rất mong được đón tiếp bạn lần sau!"}
                    </p>
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 ${review.isHelpful ? "text-primary" : ""}`}
                        onClick={() => handleHelpfulClick(review)}
                        disabled={!isLoggedIn}
                      >
                        <ThumbsUp
                          className={`h-4 w-4 mr-1 ${review.isHelpful ? "fill-primary" : ""}`}
                        />
                        <span>Hữu ích ({review.helpfulCount})</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReportClick(review)}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Báo cáo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
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
                        // Show first page, last page, current page, and pages around current page
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

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Báo cáo đánh giá</DialogTitle>
            <DialogDescription>
              Vui lòng cho chúng tôi biết lý do bạn báo cáo đánh giá này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Lý do báo cáo</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Chọn lý do báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">
                    Nội dung không phù hợp
                  </SelectItem>
                  <SelectItem value="spam">Spam hoặc quảng cáo</SelectItem>
                  <SelectItem value="fake">Đánh giá giả mạo</SelectItem>
                  <SelectItem value="offensive">Nội dung xúc phạm</SelectItem>
                  <SelectItem value="other">Lý do khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Chi tiết (không bắt buộc)</Label>
              <Textarea
                id="report-details"
                placeholder="Vui lòng cung cấp thêm thông tin..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitReport} disabled={isSubmittingReport}>
              {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
