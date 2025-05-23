"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchSchema } from "@/lib/validation";

export function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("1");
  const [roomsNeeded, setRoomsNeeded] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const searchParams = new URLSearchParams();

      if (location) {
        searchParams.append("location", location);
      }

      if (checkIn) {
        searchParams.append("checkIn", checkIn.toISOString().split("T")[0]);
      }

      if (checkOut) {
        searchParams.append("checkOut", checkOut.toISOString().split("T")[0]);
      }

      if (guests) {
        searchParams.append("guests", guests);
      }

      if (roomsNeeded) {
        searchParams.append("roomsNeeded", roomsNeeded);
      }

      // Validate the search params
      searchSchema.parse({
        location,
        checkIn: checkIn?.toISOString(),
        checkOut: checkOut?.toISOString(),
        guests: Number(guests),
        roomsNeeded: roomsNeeded ? Number(roomsNeeded) : undefined,
      });

      router.push(`/search?${searchParams.toString()}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Đã xảy ra lỗi khi tìm kiếm");
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="space-y-3">
          <label htmlFor="location" className="text-sm font-medium">
            Địa điểm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Nhập địa điểm"
              className="pl-9 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Ngày nhận phòng</label>
          <DatePicker
            date={checkIn}
            setDate={setCheckIn}
            placeholder="Chọn ngày"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Ngày trả phòng</label>
          <DatePicker
            date={checkOut}
            setDate={setCheckOut}
            placeholder="Chọn ngày"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="guests" className="text-sm font-medium">
            Số khách
          </label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger id="guests" className="w-full text-sm">
              <SelectValue placeholder="Số khách" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} khách
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label htmlFor="rooms" className="text-sm font-medium">
            Số phòng (tùy chọn)
          </label>
          <Select value={roomsNeeded} onValueChange={setRoomsNeeded}>
            <SelectTrigger id="rooms" className="w-full text-sm">
              <SelectValue placeholder="Số phòng" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} phòng
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      <div className="mt-6 flex justify-end">
        <Button type="submit" className="w-full md:w-auto">
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}
