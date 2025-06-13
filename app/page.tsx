"use client";
import { useQuery } from "@tanstack/react-query";
import { SearchForm } from "@/components/search/search-form";
import { HomestayList } from "@/components/homestay/homestay-list";
import { CartLoader } from "@/components/cart/cart-loader";

export default function Home() {
  const {
    data: featuredHomestays = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featured-homestays"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homestays?featured=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch featured homestays");
      const data = await response.json();
      return data.homestays || [];
    },
  });

  return (
    <div className="container py-8">
      <CartLoader />
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Tìm và đặt homestay tuyệt vời
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá những homestay độc đáo trên khắp Việt Nam với giá cả phải
            chăng và trải nghiệm tuyệt vời
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <SearchForm params={{}} />
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Homestay nổi bật</h2>
        </div>
        {isLoading ? (
          <div className="text-center py-8">Đang tải homestay nổi bật...</div>
        ) : isError ? (
          <div className="text-center text-red-500 py-8">Không thể tải homestay nổi bật.</div>
        ) : (
          <HomestayList homestays={featuredHomestays} />
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-primary/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">Đặt phòng dễ dàng</h3>
          <p className="text-muted-foreground mb-4">
            Tìm kiếm, so sánh và đặt phòng homestay chỉ với vài cú nhấp chuột.
            Chúng tôi cung cấp giao diện đơn giản và trực quan.
          </p>
        </div>

        <div className="bg-primary/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">Trải nghiệm độc đáo</h3>
          <p className="text-muted-foreground mb-4">
            Khám phá những homestay độc đáo với thiết kế riêng biệt và trải
            nghiệm địa phương chân thực.
          </p>
        </div>
      </section>
    </div>
  );
}
