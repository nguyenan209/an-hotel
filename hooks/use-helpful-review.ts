import { useState } from "react";

export function useHelpfulReview(
  reviewId: string,
  isHelpful: boolean,
  helpfulCount: number
) {
  const [loading, setLoading] = useState(false);

  const handleHelpfulClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHelpful: !isHelpful }),
      });

      if (!response.ok) {
        throw new Error("Failed to update helpful status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating helpful status:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { handleHelpfulClick, loading };
}
