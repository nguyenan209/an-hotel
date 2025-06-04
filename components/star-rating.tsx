import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <div className={`flex ${className}`}>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
    </div>
  );
}