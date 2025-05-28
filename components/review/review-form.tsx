"use client";

import type React from "react";
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  homestayId: string;
  homestayName: string;
  onSuccess?: () => void;
  onReviewSubmitted?: (review: {
    rating: number;
    comment: string;
    date: string;
    userName: string;
    userAvatar: string;
  }) => void;
}

export function ReviewForm({
  bookingId,
  homestayId,
  homestayName,
  onSuccess,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSubmittedReview, setShowSubmittedReview] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<{
    rating: number;
    comment: string;
    date: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating before submitting your review.')
      return;
    }

    if (review.trim().length < 10) {
      toast.error('Please write a review with at least 10 characters.')
      return;
    }

    if (!showPreview) {
      setShowPreview(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi dữ liệu đánh giá đến API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            homestayId,
            rating,
            comment: review,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const data = await response.json();

      setSubmittedReview({
        rating: data.rating,
        comment: data.comment,
        date: data.createdAt,
      });

      toast.success("Your review has been submitted successfully!");

      setShowSubmittedReview(true);
      setShowPreview(false);

      if (onReviewSubmitted) {
        onReviewSubmitted({
          rating: data.rating,
          comment: data.comment,
          date: data.createdAt,
          userName: "Bạn", // Current user name
          userAvatar: "/placeholder.svg", // Current user avatar
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = () => {
    setShowPreview(false);
    setShowSubmittedReview(false);
  };

  if (showSubmittedReview && submittedReview) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
            <CardDescription>
              Thank you for sharing your experience at {homestayName}!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= submittedReview.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {new Date(submittedReview.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{submittedReview.comment}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleEditReview}
              className="w-full"
            >
              Edit Review
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preview Your Review</CardTitle>
            <CardDescription>
              Please review your feedback before submitting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-700">{review}</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex-1"
            >
              Edit Review
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience at {homestayName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Your Review
            </label>
            <Textarea
              id="review"
              placeholder="Tell us about your stay, the amenities, the location, and your overall experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Your review will help other travelers make better choices and
              provide valuable feedback to the host.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Preview Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
