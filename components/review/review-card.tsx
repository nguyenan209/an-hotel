"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Flag } from "lucide-react";
import { ReviewResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StarRating } from "../star-rating";

interface ReviewCardProps {
  review: ReviewResponse;
  isHelpful: boolean;
  onHelpfulClick: (reviewId: string) => void;
  onReportClick: (review: ReviewResponse) => void;
}

export function ReviewCard({
  review,
  isHelpful,
  onHelpfulClick,
  onReportClick,
}: ReviewCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={review.customer.user.avatar || "/placeholder.svg"}
              alt={review.customer.user.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-3">
            <h4 className="font-medium">{review.customer.user.name}</h4>
            <p className="text-sm text-muted-foreground">
              {review.createdAt ? formatDate(review.createdAt) : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating!} />
          <Badge variant="outline">{review.rating}/5</Badge>
        </div>
      </div>

      {/* Review Content */}
      <div
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: review.comment || "" }}
      />

      {/* Owner Response */}
      <div className="ml-6 p-3 bg-gray-50 border-l-4 border-primary rounded-r-md mb-4">
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
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Nguyễn Văn Chủ</h4>
              <Badge variant="secondary" className="text-xs">
                Chủ sở hữu
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Phản hồi:{" "}
              {formatDate(
                new Date(
                  new Date(review.createdAt ?? 0).getTime() + 86400000 * 3
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
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-muted-foreground gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${isHelpful ? "text-primary" : ""}`}
            onClick={() => onHelpfulClick(review.id!)}
          >
            <ThumbsUp
              className={`h-4 w-4 mr-1 ${isHelpful ? "fill-primary" : ""}`}
            />
            <span>
              {isHelpful ? "Đã like" : "Hữu ích"} ({review.helpfulCount})
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onReportClick(review)}
          >
            <Flag className="h-4 w-4 mr-1" />
            <span>Báo cáo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
