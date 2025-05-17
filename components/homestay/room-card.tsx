"use client"

import Image from "next/image"
import { Bed, Check, Users } from "lucide-react"

import type { Room } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface RoomCardProps {
  room: Room
  isSelected?: boolean
  onSelect?: (roomId: string, isSelected: boolean) => void
  selectable?: boolean
}

export function RoomCard({ room, isSelected = false, onSelect, selectable = false }: RoomCardProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(room.id, !isSelected)
    }
  }

  return (
    <Card className={`overflow-hidden h-full flex flex-col ${isSelected ? "border-primary border-2" : ""}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.images[0] || "/placeholder.svg"}
          alt={room.name}
          fill
          className="object-cover transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold leading-tight">{room.name}</h3>
          {selectable && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              aria-label={`Select ${room.name}`}
              className="h-5 w-5"
            />
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{room.description}</p>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>Tối đa {room.capacity} khách</span>
        </div>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <Bed className="mr-1 h-4 w-4" />
          <span>
            {room.beds.map((bed, index) => (
              <span key={index}>
                {bed.count} {bed.type}
                {index < room.beds.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <div key={index} className="flex items-center text-xs">
              <Check className="mr-1 h-3 w-3 text-primary" />
              <span>{amenity}</span>
            </div>
          ))}
          {room.amenities.length > 4 && (
            <div className="text-xs text-muted-foreground">+{room.amenities.length - 4} more</div>
          )}
        </div>
        <p className="mt-2 text-lg font-bold">
          {formatCurrency(room.price)} <span className="text-sm font-normal text-muted-foreground">/ đêm</span>
        </p>
      </CardContent>
      {!selectable && (
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={handleSelect}>
            Chọn phòng
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
