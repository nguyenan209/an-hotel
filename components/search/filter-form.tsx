"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatCurrency } from "@/lib/utils"

const amenities = ["Wifi", "Bể bơi", "Bếp", "Máy lạnh", "Bãi đỗ xe", "TV", "Máy giặt", "Lò sưởi", "Ban công", "BBQ"]

const ratings = [
  { value: 4.5, label: "4.5+" },
  { value: 4, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
  { value: 3, label: "3.0+" },
]

export function FilterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([500000, 2000000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  // Initialize from URL params
  useEffect(() => {
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const amenitiesParam = searchParams.get("amenities")
    const ratingParam = searchParams.get("rating")

    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)])
    }

    if (amenitiesParam) {
      setSelectedAmenities(amenitiesParam.split(","))
    }

    if (ratingParam) {
      setSelectedRating(Number(ratingParam))
    }
  }, [searchParams])

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Update amenities
    if (selectedAmenities.length > 0) {
      params.set("amenities", selectedAmenities.join(","))
    } else {
      params.delete("amenities")
    }

    // Update rating
    if (selectedRating) {
      params.set("rating", selectedRating.toString())
    } else {
      params.delete("rating")
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Keep only search, dates and guests
    const location = params.get("location")
    const checkIn = params.get("checkIn")
    const checkOut = params.get("checkOut")
    const guests = params.get("guests")

    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("amenities")
    params.delete("rating")

    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn)
    if (checkOut) params.set("checkOut", checkOut)
    if (guests) params.set("guests", guests)

    // Reset local state
    setPriceRange([500000, 2000000])
    setSelectedAmenities([])
    setSelectedRating(null)

    router.push(`/search?${params.toString()}`)
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity])
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Bộ lọc
        </h3>
        <Button variant="ghost" size="sm" onClick={handleResetFilters}>
          Đặt lại
        </Button>
      </div>

      <Accordion type="single" collapsible defaultValue="price" className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Khoảng giá</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider value={priceRange} min={100000} max={5000000} step={100000} onValueChange={setPriceRange} />
              <div className="flex items-center justify-between">
                <span className="text-sm">{formatCurrency(priceRange[0])}</span>
                <span className="text-sm">{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities">
          <AccordionTrigger>Tiện nghi</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Đánh giá</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <div key={rating.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating.value}`}
                    checked={selectedRating === rating.value}
                    onCheckedChange={(checked) => setSelectedRating(checked ? rating.value : null)}
                  />
                  <label
                    htmlFor={`rating-${rating.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {rating.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full mt-4" onClick={handleApplyFilters}>
        Áp dụng bộ lọc
      </Button>
    </div>
  )
}
