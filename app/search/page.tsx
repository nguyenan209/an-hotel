import { Suspense } from "react"
import { SearchForm } from "@/components/search/search-form"
import { FilterForm } from "@/components/search/filter-form"
import { HomestayList } from "@/components/homestay/homestay-list"
import { searchHomestays } from "@/lib/data"
import type { SearchParams } from "@/lib/types"

interface SearchPageProps {
  searchParams: {
    location?: string
    checkIn?: string
    checkOut?: string
    guests?: string
    minPrice?: string
    maxPrice?: string
    rating?: string
    amenities?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Parse search params
  const params: SearchParams = {
    location: searchParams.location,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    guests: searchParams.guests ? Number.parseInt(searchParams.guests) : undefined,
    minPrice: searchParams.minPrice ? Number.parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number.parseInt(searchParams.maxPrice) : undefined,
    rating: searchParams.rating ? Number.parseFloat(searchParams.rating) : undefined,
    amenities: searchParams.amenities ? searchParams.amenities.split(",") : undefined,
  }

  // Search homestays
  const homestays = await searchHomestays(params)

  // Build search summary
  let searchSummary = "Tất cả homestay"
  if (params.location) {
    searchSummary = `Homestay tại ${params.location}`
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{searchSummary}</h1>
        <SearchForm />
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
  )
}
