"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Hotel,
  Home,
  MessageSquare,
  X,
  Check,
  Edit,
} from "lucide-react";

import type { CartItem as CartItemType } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { BookingType } from "@prisma/client";
import { useState } from "react";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateItemNote = useCartStore((state) => state.updateItemNote);

  const [showNoteInput, setShowNoteInput] = useState(!!item.note);
  const [itemNote, setItemNote] = useState(item.note || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleRemove = () => {
    removeFromCart(item.homestayId);
  };

  const calculateTotalPrice = () => {
    if (item.bookingType === BookingType.WHOLE) {
      console.log(item)
      return item.homestay.price * item.nights;
    } else {
      // Sum up the prices of all rooms
      const roomsTotal =
        item.rooms?.reduce((sum, room) => sum + room.price, 0) || 0;
      return roomsTotal * item.nights;
    }
  };

  const totalPrice = calculateTotalPrice();
  console.log("Total price for item:", totalPrice);

  const handleSaveNote = () => {
    updateItemNote(item.homestayId, itemNote);
  };

  const handleToggleNote = () => {
    setShowNoteInput(!showNoteInput);
    if (!showNoteInput) {
      // Khi mở note input, auto vào chế độ edit
      setIsEditing(true);
    } else {
      // Khi đóng note input, reset về chế độ view
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
      <div className="relative w-full md:w-48 h-32">
        <Image
          src={item.homestay.images[0] || "/placeholder.svg"}
          alt={item.homestay.name}
          fill
          className="object-cover rounded-md"
          sizes="(max-width: 768px) 100vw, 192px"
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <Link href={`/homestays/${item.homestayId}`}>
            <h3 className="font-semibold text-lg hover:underline">
              {item.homestay.name}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Xóa</span>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {item.homestay.location}
        </p>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="text-sm">
              <span className="font-medium">Nhận phòng:</span>{" "}
              {formatDate(new Date(item.checkIn))}
            </p>
            <p className="text-sm">
              <span className="font-medium">Trả phòng:</span>{" "}
              {formatDate(new Date(item.checkOut))}
            </p>
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Số đêm:</span> {item.nights}
            </p>
            <p className="text-sm">
              <span className="font-medium">Số khách:</span> {item.guests}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center text-sm font-medium">
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
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleNote}
            className="h-8 px-2 text-muted-foreground hover:text-primary"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="text-xs">Ghi chú</span>
          </Button>
        </div>

        {showNoteInput && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                Ghi chú cho booking này:
              </label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveNote();
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="h-6 w-6 text-primary hover:text-primary/80"
                >
                  {isEditing ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Edit className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNoteInput(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <textarea
              className="w-full min-h-[80px] p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ví dụ: Phòng tầng cao, giường thêm, thời gian nhận phòng đặc biệt..."
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ghi chú sẽ được gửi đến chủ homestay
            </p>
          </div>
        )}

        {item.bookingType === BookingType.ROOMS &&
          item.rooms &&
          item.rooms.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Phòng đã chọn:</p>
              <div className="mt-1 space-y-1">
                {item.rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex justify-between text-sm"
                  >
                    <span>{room.roomName}</span>
                    <span>{formatCurrency(room.price)} / đêm</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="mt-auto pt-2 flex justify-between items-end">
          <div>
            {item.bookingType === BookingType.WHOLE ? (
              <p className="text-sm">
                <span className="font-medium">
                  {formatCurrency(item.homestay.price)}
                </span>{" "}
                x {item.nights} đêm
              </p>
            ) : (
              <p className="text-sm">
                <span className="font-medium">
                  {formatCurrency(
                    item.rooms?.reduce((sum, room) => sum + room.price, 0) || 0
                  )}
                </span>{" "}
                x {item.nights} đêm
              </p>
            )}
          </div>
          <p className="font-bold text-lg">{formatCurrency(totalPrice)}</p>
        </div>
      </div>
    </div>
  );
}
