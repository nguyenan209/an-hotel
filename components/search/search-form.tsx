"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Calendar, Users, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchParams } from "@/lib/types"

export function SearchForm({ params }: { params: SearchParams }) {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("")

  // Xử lý khi thay đổi ngày nhận phòng
  const handleCheckInChange = (date: Date | undefined) => {
    setCheckIn(date)
    // Nếu ngày trả phòng trước ngày nhận phòng mới, reset ngày trả phòng
    if (date && checkOut && checkOut <= date) {
      setCheckOut(undefined)
    }
  }

  // Xử lý khi thay đổi ngày trả phòng
  const handleCheckOutChange = (date: Date | undefined) => {
    setCheckOut(date)
  }

  // Function để disable ngày cho ngày trả phòng (không cho chọn trước hoặc bằng ngày nhận phòng)
  const isCheckOutDisabled = (date: Date) => {
    if (!checkIn) return false
    
    const checkInDate = new Date(checkIn)
    checkInDate.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    
    return selectedDate <= checkInDate
  }

  // Function để disable ngày cho ngày nhận phòng (không cho chọn ngày trong quá khứ)
  const isCheckInDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    
    return selectedDate < today
  }

  const handleSearch = () => {
    // Validation trước khi search
    if (checkIn && checkOut && checkOut <= checkIn) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!")
      return
    }

    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn.toISOString().split("T")[0])
    if (checkOut) params.set("checkOut", checkOut.toISOString().split("T")[0])
    if (guests) params.set("guests", guests)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="p-6 bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa điểm
            </label>
            <div className="relative">
              <Input
                placeholder="Bạn muốn đi đâu?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 bg-gray-50 focus:bg-white transition-colors pr-8"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Nhận phòng
            </label>
            <DatePicker
              date={checkIn}
              setDate={handleCheckInChange}
              placeholder="Chọn ngày nhận"
              className="border-0 bg-gray-50 focus:bg-white transition-colors"
              disabled={isCheckInDisabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Trả phòng
            </label>
            <DatePicker
              date={checkOut}
              setDate={handleCheckOutChange}
              placeholder="Chọn ngày trả"
              className="border-0 bg-gray-50 focus:bg-white transition-colors"
              disabled={isCheckOutDisabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Số khách
            </label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white transition-colors">
                <SelectValue placeholder="Chọn số khách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 khách</SelectItem>
                <SelectItem value="2">2 khách</SelectItem>
                <SelectItem value="3">3 khách</SelectItem>
                <SelectItem value="4">4 khách</SelectItem>
                <SelectItem value="5">5+ khách</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div className="mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSearch}
            className="h-12 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Tìm kiếm
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  )
}
