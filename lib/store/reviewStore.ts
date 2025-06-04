import { create } from "zustand";
import { ReviewAll, ReviewAllWithFlags, ReviewResponse } from "../types";

interface ReviewStore {
  reviews: ReviewAllWithFlags[];
  helpfulReviews: string[];
  reportedReviews: string[]; // Thêm array để track các review đã báo cáo
  isLoading: boolean;
  error: string;

  // Actions
  setReviews: (reviews: ReviewAllWithFlags[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  markHelpful: (reviewId: string) => void;
  unmarkHelpful: (reviewId: string) => void;
  updateHelpfulCount: (reviewId: string, increment: boolean) => void;
  markReported: (reviewId: string) => void; // Thêm action để mark reported
  fetchReviews: (homestayId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  helpfulReviews: [],
  reportedReviews: [], // Khởi tạo array rỗng
  isLoading: false,
  error: "",

  setReviews: (reviews) => set({ reviews }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  markHelpful: (reviewId) => {
    const { helpfulReviews } = get();
    if (!helpfulReviews.includes(reviewId)) {
      set({ helpfulReviews: [...helpfulReviews, reviewId] });
    }
  },

  unmarkHelpful: (reviewId) => {
    const { helpfulReviews } = get();
    set({ helpfulReviews: helpfulReviews.filter((id) => id !== reviewId) });
  },

  updateHelpfulCount: (reviewId, increment) => {
    const { reviews } = get();
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpfulCount: increment
            ? review.helpfulCount + 1
            : Math.max(0, review.helpfulCount - 1),
        };
      }
      return review;
    });
    set({ reviews: updatedReviews });
  },

  // Thêm function để mark review đã được báo cáo
  markReported: (reviewId) => {
    const { reportedReviews } = get();
    if (!reportedReviews.includes(reviewId)) {
      set({ reportedReviews: [...reportedReviews, reviewId] });
    }
  },

  fetchReviews: async (homestayId) => {
    set({ isLoading: true, error: "" });
    try {
      const response = await fetch(`/api/reviews?homestayId=${homestayId}`);
      if (!response.ok) {
        throw new Error("Không thể tải đánh giá");
      }
      const data = await response.json();
      set({ reviews: data.reviews, helpfulReviews: data.helpfulReviews });
      console.log("Đánh giá đã được tải thành công:", data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      set({ error: "Đã xảy ra lỗi khi tải đánh giá" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
