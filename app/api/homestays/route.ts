import { NextResponse } from "next/server"
import { getHomestays, searchHomestays } from "@/lib/data"
import type { SearchParams } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse search params
    const params: SearchParams = {
      location: searchParams.get("location") || undefined,
      checkIn: searchParams.get("checkIn") || undefined,
      checkOut: searchParams.get("checkOut") || undefined,
      guests: searchParams.get("guests") ? Number.parseInt(searchParams.get("guests")!) : undefined,
      minPrice: searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number.parseInt(searchParams.get("maxPrice")!) : undefined,
      rating: searchParams.get("rating") ? Number.parseFloat(searchParams.get("rating")!) : undefined,
      amenities: searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : undefined,
    }

    // If there are search params, use searchHomestays, otherwise get all homestays
    const homestays = Object.keys(params).some((key) => params[key as keyof SearchParams] !== undefined)
      ? await searchHomestays(params)
      : await getHomestays()

    return NextResponse.json(homestays)
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
