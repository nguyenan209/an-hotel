"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Check,
  Hotel,
  Home,
  ThumbsUp,
  Flag,
  ChevronRight,
} from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { bookingSchema } from "@/lib/validation";
import { RoomCard } from "@/components/homestay/room-card";
import { AmenityList } from "@/components/homestay/amenity-list";
import { BookingType, Homestay, Review } from "@prisma/client";
import Loading from "@/components/loading";
import { ReviewResponse, RoomWithBeds } from "@/lib/types";
import { LeafletMap } from "@/components/map/leaflet-map";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReportForm from "@/components/review/review-report-form";
import { useAuth } from "@/context/AuthContext";

export default function HomestayDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const addWholeHomestayToCart = useCartStore(
    (state) => state.addWholeHomestayToCart
  );
  const addRoomsToCart = useCartStore((state) => state.addRoomsToCart);
  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [rooms, setRooms] = useState<RoomWithBeds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isLoggedIn } = useAuth(); // Lấy trạng thái đăng nhập từ AuthContext
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("1");
  const [bookingType, setBookingType] = useState<BookingType>(
    BookingType.WHOLE
  );
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState("");
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);
  // State cho dialog báo cáo
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState<string>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchHomestay = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/homestays/${id}`
        );
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rooms?homestayId=${id}`
        );
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
  }, [id]);

  async function fetchReviews(
    homestayId: string,
    setReviews: Function,
    setHelpfulReviews: Function,
    setReviewsError: Function,
    setIsLoadingReviews: Function
  ) {
    setIsLoadingReviews(true);
    setReviewsError("");

    try {
      const response = await fetch(`/api/reviews?homestayId=${homestayId}`);
      if (!response.ok) {
        throw new Error("Không thể tải đánh giá");
      }
      const data = await response.json();

      setReviews(data.reviews);
      setHelpfulReviews(
        data.reviews
          .filter((review: any) => review.isHelpful)
          .map((r: any) => r.id)
      );
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviewsError("Đã xảy ra lỗi khi tải đánh giá");
    } finally {
      setIsLoadingReviews(false);
    }
  }

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchReviews(
        id,
        setReviews,
        setHelpfulReviews,
        setReviewsError,
        setIsLoadingReviews
      );
    }
  }, [id]);

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
    if (bookingType === BookingType.WHOLE) {
      return homestay?.price || 0;
    } else {
      return selectedRooms.reduce((total, roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        return total + (room?.price || 0);
      }, 0);
    }
  };

  const handleAddToCart = async () => {
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

      if (bookingType === BookingType.ROOMS && selectedRooms.length === 0) {
        setBookingError("Vui lòng chọn ít nhất một phòng");
        return;
      }

      if (bookingType === BookingType.ROOMS) {
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

        await addRoomsToCart(
          homestay,
          selectedRoomsData,
          checkIn!.toISOString(),
          checkOut!.toISOString(),
          Number(guests)
        );
      } else {
        // Add whole homestay to cart
        console.log("Adding whole homestay to cart");
        await addWholeHomestayToCart(
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

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  if (isLoading) {
    return <Loading />;
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

  const handleHelpfulClick = async (review: ReviewResponse) => {
    // Kiểm tra trạng thái đăng nhập
    if (!isLoggedIn) {
      toast({
        title: "Bạn cần đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng tính năng này.",
        variant: "default",
      });
      router.push("/login"); // Chuyển hướng đến trang đăng nhập
      return;
    }

    const isAlreadyHelpful = helpfulReviews.includes(review.id!); // Kiểm tra trạng thái hiện tại

    try {
      // Gửi yêu cầu đến API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${review.id}/helpful`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewId: review.id,
            isHelpful: !isAlreadyHelpful, // Đảo ngược trạng thái hiện tại
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update helpful status");
      }

      const updatedReview = await response.json();

      // Cập nhật state trên client
      setHelpfulReviews(
        (prev) =>
          isAlreadyHelpful
            ? prev.filter((id) => id !== review.id) // Xóa khỏi danh sách nếu bỏ like
            : [...prev, review.id!] // Thêm vào danh sách nếu like
      );

      setReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === review.id
            ? { ...r, helpfulCount: updatedReview.review.helpfulCount }
            : r
        )
      );

      toast({
        title: isAlreadyHelpful
          ? "Đã bỏ đánh dấu hữu ích"
          : "Đã đánh dấu hữu ích",
        description: isAlreadyHelpful
          ? "Bạn đã bỏ đánh dấu đánh giá này là hữu ích."
          : "Cảm ơn bạn đã đánh dấu đánh giá này là hữu ích.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating helpful status:", error);
      toast({
        title: "Không thể cập nhật trạng thái hữu ích",
        description: "Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Xử lý khi người dùng bấm vào nút báo cáo
  const handleReportClick = (review: Review) => {
    setReportingReview(review);
    setReportReason("inappropriate");
    setReportDetails("");
    setReportDialogOpen(true);
  };

  // Xử lý khi người dùng gửi báo cáo
  const handleSubmitReport = async () => {
    if (!reportingReview) return;

    setIsSubmittingReport(true);

    try {
      // Giả lập gửi báo cáo đến server
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Đóng dialog và hiển thị thông báo thành công
      setReportDialogOpen(false);
      toast({
        title: "Báo cáo đã được gửi",
        description:
          "Cảm ơn bạn đã gửi báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.",
        variant: "default",
      });
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      toast({
        title: "Không thể gửi báo cáo",
        description: "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{homestay.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{homestay.address}</span>
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="rooms">Phòng</TabsTrigger>
              <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
              <TabsTrigger value="location">Địa điểm</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="prose max-w-none">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: homestay.description }}
                />
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
                Your Review
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
                  rooms.map((room) => {
                    return <RoomCard key={room.id} room={room} />;
                  })
                ) : (
                  <p className="col-span-full text-muted-foreground">
                    Không có thông tin phòng
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="amenities" className="mt-4">
              <AmenityList
                amenities={homestay.amenities}
                showTooltip={true}
                columns={4}
              />
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 mr-2 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{homestay.rating}</span>
                <span className="text-muted-foreground ml-2">
                  ({reviews.length} đánh giá)
                </span>
              </div>

              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviewsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{reviewsError}</p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      fetchReviews(
                        id,
                        setReviews,
                        setHelpfulReviews,
                        setReviewsError,
                        setIsLoadingReviews
                      )
                    }
                  >
                    Thử lại
                  </Button>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Phần đánh giá của khách */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden">
                            <Image
                              src={
                                review.customer.user.avatar ||
                                "/placeholder.svg"
                              }
                              alt={review.customer.user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">
                              {review.customer.user.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {moment(review.createdAt).format("DD/MM/YYYY")}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {renderStars(review.rating!)}
                        </div>
                      </div>
                      <div
                        className="mb-4"
                        dangerouslySetInnerHTML={{
                          __html: review.comment || "",
                        }}
                      />

                      {/* Phần trả lời của chủ sở hữu - Hiển thị cho tất cả đánh giá */}
                      <div className="mt-4 mb-4 ml-6 p-3 bg-gray-50 border-l-4 border-primary rounded-r-md">
                        <div className="flex items-center mb-2">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src="/diverse-person-portrait.png"
                              alt="Chủ sở hữu"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-2">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium">
                                Nguyễn Văn Chủ
                              </h4>
                              <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                Chủ sở hữu
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Phản hồi:{" "}
                              {formatDate(
                                moment(review.createdAt)
                                  .add(3, "days")
                                  .toISOString()
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">
                          {review.rating! >= 4
                            ? review.ownerReply
                            : "Cảm ơn bạn đã chia sẻ phản hồi! Chúng tôi xin lỗi về những bất tiện bạn đã gặp phải. Chúng tôi sẽ cải thiện dịch vụ để mang đến trải nghiệm tốt hơn cho khách hàng trong tương lai. Rất mong được đón tiếp bạn lần sau!"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 ${
                              helpfulReviews.includes(review.id!)
                                ? "text-primary"
                                : ""
                            }`}
                            onClick={() => handleHelpfulClick(review)}
                          >
                            <ThumbsUp
                              className={`h-4 w-4 mr-1 ${
                                helpfulReviews.includes(review.id!)
                                  ? "fill-primary"
                                  : ""
                              }`}
                            />
                            <span>
                              {helpfulReviews.includes(review.id!)
                                ? "Đã like"
                                : "Hữu ích"}{" "}
                              ({review.helpfulCount})
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() =>
                              review.id && handleReportClick(review as Review)
                            }
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            <span>Báo cáo</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href={`/homestays/${id}/reviews`}>
                        <Button variant="outline" className="mt-2">
                          Xem tất cả {reviews.length} đánh giá
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="location" className="mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vị trí</h3>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{homestay.address}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Bản đồ</h4>
                  <LeafletMap
                    latitude={10.762622} // Tọa độ mẫu cho TP.HCM
                    longitude={106.660172}
                    zoom={15}
                    height="h-64"
                    markerTitle={homestay.name}
                    className="mb-4"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    📍 Vị trí chính xác sẽ được chia sẻ sau khi đặt phòng
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Thông tin khu vực</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Gần đây</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Bãi biển - 5 phút đi bộ</li>
                        <li>• Chợ địa phương - 10 phút đi bộ</li>
                        <li>• Nhà hàng - 3 phút đi bộ</li>
                        <li>• Siêu thị - 15 phút đi bộ</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Giao thông</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Sân bay - 45 phút lái xe</li>
                        <li>• Ga tàu - 20 phút lái xe</li>
                        <li>• Bến xe buýt - 5 phút đi bộ</li>
                        <li>• Thuê xe máy - 2 phút đi bộ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
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
                      setBookingType(value as BookingType)
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={BookingType.WHOLE}
                        id={BookingType.WHOLE}
                      />
                      <Label
                        htmlFor={BookingType.WHOLE}
                        className="flex items-center"
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Đặt toàn bộ homestay
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={BookingType.ROOMS}
                        id={BookingType.ROOMS}
                      />
                      <Label
                        htmlFor={BookingType.ROOMS}
                        className="flex items-center"
                      >
                        <Hotel className="mr-2 h-4 w-4" />
                        Đặt từng phòng
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {bookingType === BookingType.ROOMS &&
                homestay.allowsPartialBooking && (
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
                    {bookingType === BookingType.ROOMS &&
                      selectedRooms.length > 0 && (
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

      {/* Dialog báo cáo đánh giá */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Báo cáo đánh giá</DialogTitle>
            <DialogDescription>
              Vui lòng cho chúng tôi biết lý do bạn báo cáo đánh giá này. Chúng
              tôi sẽ xem xét và có biện pháp xử lý phù hợp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Lý do báo cáo</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Chọn lý do báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">
                    Nội dung không phù hợp
                  </SelectItem>
                  <SelectItem value="spam">Spam hoặc quảng cáo</SelectItem>
                  <SelectItem value="fake">Đánh giá giả mạo</SelectItem>
                  <SelectItem value="offensive">Nội dung xúc phạm</SelectItem>
                  <SelectItem value="other">Lý do khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Chi tiết (không bắt buộc)</Label>
              <ReportForm
                onSubmit={(details) => {
                  setReportDetails(details);
                  handleSubmitReport();
                }}
                onCancel={() => setReportDialogOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
