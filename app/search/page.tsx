import { Suspense } from "react";
import { SearchForm } from "@/components/search/search-form";
import { FilterForm } from "@/components/search/filter-form";
import { HomestayList } from "@/components/homestay/homestay-list";
import type { SearchPageProps, SearchParams } from "@/lib/types";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Parse search params

  const resolvedSearchParams = await searchParams;
  const params: SearchParams = {
    location: resolvedSearchParams.location,
    checkIn: resolvedSearchParams.checkIn,
    checkOut: resolvedSearchParams.checkOut,
    guests: resolvedSearchParams.guests
      ? Number.parseInt(resolvedSearchParams.guests)
      : undefined,
    minPrice: resolvedSearchParams.minPrice
      ? Number.parseInt(resolvedSearchParams.minPrice)
      : undefined,
    maxPrice: resolvedSearchParams.maxPrice
      ? Number.parseInt(resolvedSearchParams.maxPrice)
      : undefined,
    rating: resolvedSearchParams.rating
      ? Number.parseFloat(resolvedSearchParams.rating)
      : undefined,
    amenities: resolvedSearchParams.amenities
      ? resolvedSearchParams.amenities.split(",")
      : undefined,
  };

  // Loại bỏ các giá trị undefined khỏi params
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  );

  // Fetch homestays from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/homestays/search?${new URLSearchParams(filteredParams)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch homestays");
  }

  const homestays = await response.json();

  // Build search summary
  let searchSummary = "Tất cả homestay";
  if (params.location) {
    searchSummary = `Homestay tại ${params.location}`;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{searchSummary}</h1>
        <SearchForm params={params} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterForm />
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={<div>Đang tải...</div>}>
            <HomestayList
              homestays={homestays}
              emptyMessage="Không tìm thấy homestay nào phù hợp với tiêu chí tìm kiếm của bạn."
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
