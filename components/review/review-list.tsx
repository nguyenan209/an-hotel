"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, Flag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  userHasMarkedHelpful?: boolean;
}

interface ReviewListProps {
  homestayId: string;
}

export function ReviewList({ homestayId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to fetch reviews
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock reviews data
        const mockReviews: Review[] = [
          {
            id: "r1",
            userId: "u1",
            userName: "John Doe",
            rating: 5,
            comment:
              "Amazing place! The location was perfect, and the host was very accommodating. The homestay was clean, comfortable, and had all the amenities we needed. Would definitely stay here again!",
            createdAt: "2025-04-15T10:30:00Z",
            helpful: 12,
            userHasMarkedHelpful: false,
          },
          {
            id: "r2",
            userId: "u2",
            userName: "Jane Smith",
            userAvatar: "/diverse-avatars.png",
            rating: 4,
            comment:
              "Great location and beautiful views. The rooms were spacious and clean. The only downside was the WiFi was a bit slow, but overall a wonderful experience.",
            createdAt: "2025-04-10T14:20:00Z",
            helpful: 8,
            userHasMarkedHelpful: true,
          },
          {
            id: "r3",
            userId: "u3",
            userName: "Robert Johnson",
            rating: 5,
            comment:
              "Exceptional service and beautiful property. The host went above and beyond to make our stay comfortable. Highly recommended!",
            createdAt: "2025-04-05T09:15:00Z",
            helpful: 15,
            userHasMarkedHelpful: false,
          },
        ];

        setReviews(mockReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [homestayId]);

  const handleMarkHelpful = (reviewId: string) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            helpful: review.userHasMarkedHelpful
              ? review.helpful - 1
              : review.helpful + 1,
            userHasMarkedHelpful: !review.userHasMarkedHelpful,
          };
        }
        return review;
      })
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <User className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium">No Reviews Yet</h3>
          <p className="text-gray-500 text-center mt-1">
            This homestay doesn't have any reviews yet. Be the first to share
            your experience!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Guest Reviews ({reviews.length})
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
          <span className="font-medium">
            {(
              reviews.reduce((acc, review) => acc + review.rating, 0) /
              reviews.length
            ).toFixed(1)}
          </span>
        </div>
      </div>

      {reviews.map((review) => (
        <Card key={review.id} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{review.userName}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{review.comment}</p>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className={
                  review.userHasMarkedHelpful ? "text-primary" : "text-gray-500"
                }
                onClick={() => handleMarkHelpful(review.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful ({review.helpful})
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
