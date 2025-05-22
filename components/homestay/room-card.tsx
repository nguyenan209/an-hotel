"use client";

import Image from "next/image";
import { Bed, Check, ChevronLeft, ChevronRight, Users, X } from "lucide-react";

import type { Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useState } from "react";

interface RoomCardProps {
  room: Room;
  isSelected?: boolean;
  onSelect?: (roomId: string, isSelected: boolean) => void;
  selectable?: boolean;
}

export function RoomCard({
  room,
  isSelected = false,
  onSelect,
  selectable = false,
}: RoomCardProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleCardClick = () => {
    if (!selectable) {
      setCurrentImageIndex(0);
      setShowGallery(true);
    }
  };

  const handleNextImage = (e: unknown) => {
    setCurrentImageIndex((prev: number) =>
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = (e: unknown) => {
    setCurrentImageIndex((prev: number) =>
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(room.id, !isSelected);
    }
  };

  return (
    <Card
      className={`overflow-hidden h-full flex flex-col ${
        isSelected ? "border-primary border-2" : ""
      } ${!selectable ? "cursor-pointer" : ""}`}
      onClick={!selectable ? handleCardClick : undefined}
    >
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
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {room.description}
        </p>
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
            <div className="text-xs text-muted-foreground">
              +{room.amenities.length - 4} more
            </div>
          )}
        </div>
        <p className="mt-2 text-lg font-bold">
          {formatCurrency(room.price)}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            / đêm
          </span>
        </p>
      </CardContent>

      {/* Image Gallery Dialog */}
      <Dialog
        open={showGallery}
        onOpenChange={(open) => {
          setShowGallery(open);
        }}
      >
        <DialogContent
          className="sm:max-w-4xl p-0 overflow-hidden bg-black/90 border-none"
          onPointerDownOutside={() => setShowGallery(false)}
          onEscapeKeyDown={() => setShowGallery(false)}
        >
          <DialogHeader className="absolute top-0 right-0 z-10">
            <button
              type="button"
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowGallery(false);
              }}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>

          <div
            className="relative h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={room.images[currentImageIndex] || "/placeholder.svg"}
                alt={`${room.name} - Ảnh ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Navigation Buttons */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage(e);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage(e);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {room.images.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="bg-black/90 p-2 overflow-x-auto">
            <div className="flex space-x-2">
              {room.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 ${
                    currentImageIndex === idx
                      ? "border-white"
                      : "border-transparent"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${room.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
