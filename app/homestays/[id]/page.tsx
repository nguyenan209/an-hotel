"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Star, Check, Hotel, Home } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { bookingSchema } from "@/lib/validation";
import { RoomCard } from "@/components/homestay/room-card";
import type { Homestay, Room } from "@/lib/types";
import { AmenityList } from "@/components/homestay/amenity-list";

interface HomestayDetailPageProps {
  params: {
    id: string;
  };
}

export default function HomestayDetailPage({
  params,
}: HomestayDetailPageProps) {
  const router = useRouter();
  const addWholeHomestayToCart = useCartStore(
    (state) => state.addWholeHomestayToCart
  );
  const addRoomsToCart = useCartStore((state) => state.addRoomsToCart);

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("1");
  const [bookingType, setBookingType] = useState<"whole" | "rooms">("whole");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchHomestay = async () => {
      try {
        const response = await fetch(`/api/homestays/${params.id}`);
        if (!response.ok) {
          throw new Error("Không thể tải thông tin homestay");
        }
  
        const data = await response.json();
        setHomestay(data);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải thông tin homestay");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    const fetchRooms = async () => {
      try {
        const response = await fetch(`/api/rooms?homestayId=${params.id}`);
        if (!response.ok) {
          throw new Error("Không thể tải thông tin phòng");
        }
  
        const data = await response.json();
        setRooms(data.rooms || []); // Đảm bảo rooms là một mảng
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
  
    fetchHomestay();
    fetchRooms();
  }, [params.id]);

  const handleRoomSelection = (roomId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRooms([...selectedRooms, roomId]);
    } else {
      setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
    }
  };

  const calculateTotalCapacity = () => {
    return selectedRooms.reduce((total, roomId) => {
      const room = rooms.find((r) => r.id === roomId);
      return total + (room?.capacity || 0);
    }, 0);
  };

  const calculateTotalPrice = () => {
    if (bookingType === "whole") {
      return homestay?.price || 0;
    } else {
      return selectedRooms.reduce((total, roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        return total + (room?.price || 0);
      }, 0);
    }
  };

  const handleAddToCart = () => {
    if (!homestay) return;

    setBookingError("");

    try {
      // Validate booking data
      bookingSchema.parse({
        checkIn: checkIn?.toISOString(),
        checkOut: checkOut?.toISOString(),
        guests: Number(guests),
        bookingType,
        selectedRooms,
      });

      if (bookingType === "rooms" && selectedRooms.length === 0) {
        setBookingError("Vui lòng chọn ít nhất một phòng");
        return;
      }

      if (bookingType === "rooms") {
        const totalCapacity = calculateTotalCapacity();
        if (Number(guests) > totalCapacity) {
          setBookingError(
            `Số lượng khách vượt quá sức chứa của các phòng đã chọn (tối đa ${totalCapacity} khách)`
          );
          return;
        }

        // Add selected rooms to cart
        const selectedRoomsData = rooms.filter((room) =>
          selectedRooms.includes(room.id)
        );
        addRoomsToCart(
          homestay,
          selectedRoomsData,
          checkIn!.toISOString(),
          checkOut!.toISOString(),
          Number(guests)
        );
      } else {
        // Add whole homestay to cart
        addWholeHomestayToCart(
          homestay,
          checkIn!.toISOString(),
          checkOut!.toISOString(),
          Number(guests)
        );
      }

      // Show success message or redirect
      router.push("/cart");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setBookingError(err.errors[0].message);
      } else {
        setBookingError("Đã xảy ra lỗi khi thêm vào giỏ hàng");
      }
    }
  };

  const handleBookNow = () => {
    handleAddToCart();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !homestay) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">{error || "Không tìm thấy homestay"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{homestay.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{homestay.location}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{homestay.rating}</span>
            </div>
          </div>

          <Carousel className="mb-8">
            <CarouselContent>
              {homestay.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${homestay.name} - Ảnh ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <Tabs defaultValue="description" className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="rooms">Phòng</TabsTrigger>
              <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="prose max-w-none">
                <p>{homestay.description}</p>
                <p>
                  Homestay này có thể phục vụ tối đa {homestay.maxGuests} khách,
                  là lựa chọn lý tưởng cho{" "}
                  {homestay.maxGuests <= 2
                    ? "cặp đôi"
                    : homestay.maxGuests <= 4
                    ? "gia đình nhỏ"
                    : "nhóm bạn bè hoặc gia đình lớn"}
                  .
                </p>
                <p>
                  Tổng số phòng: {homestay.totalRooms} phòng
                  {homestay.allowsPartialBooking
                    ? " (Có thể đặt từng phòng riêng lẻ)"
                    : " (Chỉ có thể đặt toàn bộ homestay)"}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="rooms" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.length > 0 ? (
                  rooms.map((room) => <RoomCard key={room.id} room={room} />)
                ) : (
                  <p className="col-span-full text-muted-foreground">
                    Không có thông tin phòng
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="amenities" className="mt-4">
              <AmenityList amenities={homestay.amenities} showTooltip={true} columns={4} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 mr-2 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{homestay.rating}</span>
                <span className="text-muted-foreground ml-2">
                  (12 đánh giá)
                </span>
              </div>
              <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">
                {formatCurrency(homestay.price)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / đêm
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày nhận phòng</label>
                <DatePicker
                  date={checkIn}
                  setDate={setCheckIn}
                  placeholder="Chọn ngày nhận phòng"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày trả phòng</label>
                <DatePicker
                  date={checkOut}
                  setDate={setCheckOut}
                  placeholder="Chọn ngày trả phòng"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="guests" className="text-sm font-medium">
                  Số khách
                </label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger id="guests">
                    <SelectValue placeholder="Số khách" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: homestay.maxGuests },
                      (_, i) => i + 1
                    ).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} khách
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {homestay.allowsPartialBooking && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-sm font-medium">Loại đặt phòng</label>
                  <RadioGroup
                    value={bookingType}
                    onValueChange={(value) =>
                      setBookingType(value as "whole" | "rooms")
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whole" id="whole" />
                      <Label htmlFor="whole" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Đặt toàn bộ homestay
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rooms" id="rooms" />
                      <Label htmlFor="rooms" className="flex items-center">
                        <Hotel className="mr-2 h-4 w-4" />
                        Đặt từng phòng
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {bookingType === "rooms" && homestay.allowsPartialBooking && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-sm font-medium">Chọn phòng</label>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`border rounded-md p-3 cursor-pointer transition-colors ${
                          selectedRooms.includes(room.id)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() =>
                          handleRoomSelection(
                            room.id,
                            !selectedRooms.includes(room.id)
                          )
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{room.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Tối đa {room.capacity} khách
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(room.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {bookingType === "rooms" && selectedRooms.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm">Tổng giá phòng:</span>
                      <span className="font-semibold">
                        {formatCurrency(calculateTotalPrice())}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {bookingError && (
              <p className="text-sm text-red-500 mb-4">{bookingError}</p>
            )}

            <div className="space-y-2">
              <Button className="w-full" onClick={handleBookNow}>
                Đặt ngay
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Bạn chưa bị trừ tiền
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
