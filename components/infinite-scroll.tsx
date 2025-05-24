import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  onLoadMore: () => void; // Hàm gọi khi cần tải thêm dữ liệu
  hasMore: boolean; // Có còn dữ liệu để tải không
  isLoading: boolean; // Đang tải dữ liệu hay không
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={observerTarget}
      className="py-4 text-center text-sm text-muted-foreground"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading more...
        </div>
      ) : hasMore ? (
        "Scroll to load more"
      ) : (
        "No more items to load"
      )}
    </div>
  );
}
