"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useReviewStore } from "@/lib/store/reviewStore";
import { formatDate } from "@/lib/utils";
import { ReportReason } from "@prisma/client";
import { ChevronRight, Flag, Star, ThumbsUp, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ReviewSectionProps {
  homestayId: string;
  homestayRating: number;
  showViewAllLink?: boolean;
  maxReviews?: number;
  className?: string;
}

export function ReviewSection({
  homestayId,
  homestayRating,
  showViewAllLink = true,
  maxReviews = 3,
  className = "",
}: ReviewSectionProps) {
  const {
    reviews,
    helpfulReviews,
    reportedReviews, // Thêm reportedReviews từ store
    isLoading,
    error,
    markHelpful,
    unmarkHelpful,
    updateHelpfulCount,
    markReported, // Thêm markReported từ store
    fetchReviews,
    setError,
    setReviews,
  } = useReviewStore();

  const [reviewsToShow, setReviewsToShow] = useState(maxReviews);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<any>(null);
  const [reportReason, setReportReason] = useState<ReportReason>(ReportReason.INAPPROPRIATE);
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (homestayId) {
      fetchReviews(homestayId);
    }
  }, [homestayId, fetchReviews]);

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

  const handleHelpfulClick = async (review: any) => {
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
      // Cập nhật lại review trong state
      setReviews(
        reviews.map((r) =>
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

  const handleReportClick = (review: any) => {
    setReportingReview(review);
    setReportReason(ReportReason.INAPPROPRIATE);
    setReportDetails("");
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reportingReview) return;
    setIsSubmittingReport(true);
    try {
      const response = await fetch(`/api/reviews/${reportingReview.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      if (!response.ok) throw new Error("Không thể gửi báo cáo");
      // Update review in state to isReported: true
      setReviews(
        reviews.map((r) =>
          r.id === reportingReview.id ? { ...r, isReported: true } : r
        )
      );
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
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-1/3" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setError("");
            fetchReviews(homestayId);
          }}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <User className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium">Chưa có đánh giá</h3>
          <p className="text-gray-500 text-center mt-1">
            Homestay này chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ
            trải nghiệm của bạn!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Đánh giá của khách ({reviews.length})
        </h2>
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="font-medium">{homestayRating}</span>
        </div>
      </div>

      {reviews.slice(0, reviewsToShow).map((review) => (
        <Card
          key={review.id}
          className="mb-4 hover:bg-gray-50 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src={review.customer.user.name || "/placeholder.svg"} />
                  <AvatarFallback>{review.customer.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h4 className="font-medium">{review.customer.user.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {renderStars(review.rating)}
              </div>
            </div>

            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Owner Response */}
            <div className="mt-4 mb-4 ml-6 p-3 bg-gray-50 border-l-4 border-primary rounded-r-md">
              <div className="flex items-center mb-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src="/diverse-person-portrait.png"
                    alt="Chủ sở hữu"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-2">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">Nguyễn Văn Chủ</h4>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      Chủ sở hữu
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Phản hồi:{" "}
                    {formatDate(
                      new Date(
                        new Date(review.createdAt).getTime() + 86400000 * 3
                      ).toISOString()
                    )}
                  </p>
                </div>
              </div>
              <p className="text-sm">
                {review.rating >= 4
                  ? "Cảm ơn bạn đã đánh giá tích cực về Homestay của chúng tôi! Chúng tôi rất vui khi biết bạn đã có trải nghiệm tuyệt vời. Mong được đón tiếp bạn trong những lần tới!"
                  : "Cảm ơn bạn đã chia sẻ phản hồi! Chúng tôi xin lỗi về những bất tiện bạn đã gặp phải. Chúng tôi sẽ cải thiện dịch vụ để mang đến trải nghiệm tốt hơn cho khách hàng trong tương lai. Rất mong được đón tiếp bạn lần sau!"}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${isLoggedIn && review.isHelpful ? "text-primary" : ""}`}
                  onClick={() => handleHelpfulClick(review)}
                  disabled={!isLoggedIn}
                >
                  <ThumbsUp
                    className={`h-8 px-2 ${isLoggedIn && review.isHelpful ? "text-primary" : ""}`}
                  />
                  <span>Hữu ích ({review.helpfulCount})</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${review.isReported ? "text-red-500" : ""}`}
                  onClick={() => handleReportClick(review)}
                  disabled={review.isReported}
                >
                  <Flag
                    className={`h-4 w-4 mr-1 ${review.isReported ? "fill-red-500" : ""}`}
                  />
                  <span>
                    {review.isReported ? "Đã báo cáo" : "Báo cáo"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {reviews.length > reviewsToShow && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() =>
              setReviewsToShow((prev) => Math.min(prev + 3, reviews.length))
            }
            className="mr-2"
          >
            Xem thêm đánh giá ({reviews.length - reviewsToShow} còn lại)
          </Button>
        </div>
      )}

      {showViewAllLink &&
        reviewsToShow >= reviews.length &&
        reviews.length > maxReviews && (
          <div className="text-center pt-2">
            <Link href={`/homestays/${homestayId}/reviews`}>
              <Button variant="ghost" size="sm">
                Xem tất cả đánh giá trên trang riêng
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

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
              <Select value={reportReason} onValueChange={(value) => setReportReason(value as ReportReason)}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Chọn lý do báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportReason.INAPPROPRIATE}>
                    Nội dung không phù hợp
                  </SelectItem>
                  <SelectItem value={ReportReason.SPAM}>Spam hoặc quảng cáo</SelectItem>
                  <SelectItem value={ReportReason.FAKE}>Đánh giá giả mạo</SelectItem>
                  <SelectItem value={ReportReason.OFFENSIVE}>Nội dung xúc phạm</SelectItem>
                  <SelectItem value={ReportReason.OTHER}>Lý do khác</SelectItem>
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
