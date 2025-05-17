import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { CartItem } from "@/lib/types"
import { Hotel, Home } from "lucide-react"

interface BookingSummaryProps {
  items: CartItem[]
  totalPrice: number
}

export function BookingSummary({ items, totalPrice }: BookingSummaryProps) {
  return (
    <div className="border rounded-lg p-6 shadow-sm sticky top-24">
      <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

      <div className="space-y-4 mb-4">
        {items.map((item) => (
          <div key={item.homestayId} className="space-y-2">
            <div className="font-medium">{item.homestay.name}</div>
            <div className="text-sm text-muted-foreground">{item.homestay.location}</div>
            <div className="text-sm">
              {formatDate(new Date(item.checkIn))} - {formatDate(new Date(item.checkOut))}
            </div>
            <div className="text-sm flex items-center">
              {item.bookingType === "whole" ? (
                <>
                  <Home className="mr-1 h-4 w-4" /> Toàn bộ homestay
                </>
              ) : (
                <>
                  <Hotel className="mr-1 h-4 w-4" /> {item.rooms?.length || 0} phòng
                </>
              )}
            </div>
            <div className="text-sm">
              {item.nights} đêm × {item.guests} khách
            </div>

            {item.bookingType === "rooms" && item.rooms && item.rooms.length > 0 && (
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

      <div className="space-y-2">
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

      <div className="flex justify-between text-lg font-bold mb-2">
        <span>Tổng cộng:</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>

      <div className="text-center text-sm text-muted-foreground">Giá đã bao gồm thuế và phí</div>
    </div>
  )
}
