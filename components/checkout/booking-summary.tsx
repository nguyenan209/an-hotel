"use client";

import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingType } from "@prisma/client";
import { Home, Hotel, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface BookingSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export function BookingSummary({ items, totalPrice }: BookingSummaryProps) {
  const [showNote, setShowNote] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 sticky top-24">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-3">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-6 mb-6">
        {items.map((item) => (
          <div
            key={item.homestayId}
            className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm space-y-3"
          >
            <div className="font-semibold text-lg text-gray-800">
              {item.homestay.name}
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {item.homestay.location}
            </div>
            <div className="text-sm">
              {formatDate(new Date(item.checkIn))} -{" "}
              {formatDate(new Date(item.checkOut))}
            </div>
            <div className="text-sm flex items-center">
              {item.bookingType === BookingType.WHOLE ? (
                <>
                  <Home className="mr-1 h-4 w-4" /> Toàn bộ homestay
                </>
              ) : (
                <>
                  <Hotel className="mr-1 h-4 w-4" /> {item.rooms?.length || 0}{" "}
                  phòng
                </>
              )}
              {item.note && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 px-2 text-xs"
                  onClick={() =>
                    setShowNote(
                      showNote === item.homestayId ? null : item.homestayId
                    )
                  }
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Ghi chú
                </Button>
              )}
            </div>

            {showNote === item.homestayId && item.note && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <div className="text-blue-800 font-medium mb-1">Ghi chú:</div>
                <div className="text-blue-700">{item.note}</div>
              </div>
            )}
            <div className="text-sm">
              {item.nights} đêm × {item.guests} khách
            </div>

            {item.bookingType === BookingType.ROOMS &&
              item.rooms &&
              item.rooms.length > 0 && (
                <div className="text-sm space-y-1">
                  <div className="font-medium">Phòng đã chọn:</div>
                  {item.rooms.map((room) => (
                    <div key={room.roomId} className="flex justify-between">
                      <span>{room.roomName}</span>
                      <span>{formatCurrency(room.price)}</span>
                    </div>
                  ))}
                </div>
              )}

            <Separator className="my-2" />
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Số lượng homestay:</span>
          <span>{items.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tổng số đêm:</span>
          <span>{items.reduce((total, item) => total + item.nights, 0)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-xl font-bold mb-3 text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
        <span>Tổng cộng:</span>
        <span className="text-pink-600">{formatCurrency(totalPrice)}</span>
      </div>

      <div className="text-center text-sm text-gray-500 bg-gray-100 p-2 rounded-md">
        Giá đã bao gồm thuế và phí
      </div>
    </div>
  );
}
