"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import TinyMCEEditor from "../tinymce-editor";

interface ReviewSectionProps {
  bookingId: string;
  homestayId: string;
  homestayName: string;
}

export function ReviewSection({
  bookingId,
  homestayId,
  homestayName,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<{
    rating: number;
    comment: string;
    createdAt: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchUserReview = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/review?homestayId=${homestayId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserReview(data.review);
        }
      } catch (error) {
        console.error("Failed to fetch user review:", error);
      }
    };

    fetchUserReview();
  }, [homestayId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting your review.");
      return;
    }

    if (review.trim().length < 10) {
      toast.error("Please write a review with at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
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
      setUserReview({
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt,
      });

      toast.success("Your review has been submitted successfully!");
      setShowPreview(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userReview) {
    return (
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
                  star <= userReview.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {new Date(userReview.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: userReview.comment }}
          />
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => {
              setUserReview(null);
              setRating(userReview.rating);
              setReview(userReview.comment);
            }}
            className="w-full"
          >
            Edit Review
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (showPreview) {
    return (
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
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: review }}
          />
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
      <CardContent>
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
          <TinyMCEEditor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""}
            value={review}
            onChange={(content) => setReview(content)}
            height={300}
            folder="reviews"
          />
          <p className="text-xs text-gray-500">
            Your review will help other travelers make better choices and
            provide valuable feedback to the host.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setShowPreview(true)} className="w-full">
          Preview Review
        </Button>
      </CardFooter>
    </Card>
  );
}
