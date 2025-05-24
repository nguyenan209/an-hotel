import Image from "next/image";
import { Star, ThumbsUp, Flag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Review } from "@prisma/client";

interface ReviewsProps {
  reviews: Review[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}

export function Reviews({ reviews, isLoading, error, onRetry }: ReviewsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-3 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">Chưa có đánh giá nào.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.slice(0, 3).map((review) => (
        <div
          key={review.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src={review.ownerId || "/placeholder.svg"}
                  alt={review.ownerId}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-3">
                <h4 className="font-medium">{review.ownerId}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
            </div>
          </div>
          <p className="mb-4">{review.comment}</p>
        </div>
      ))}

      {reviews.length > 3 && (
        <div className="text-center pt-2">
          <Link href={`/homestays/reviews`}>
            <Button variant="outline" className="mt-2">
              Xem tất cả {reviews.length} đánh giá
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
