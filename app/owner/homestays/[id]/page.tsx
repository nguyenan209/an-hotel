"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { homestaySchema } from "@/lib/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { debounce } from "lodash";
import {
  createHomestay,
  fetchAddressResults,
  fetchHomestayData,
} from "@/lib/homestay";
import Cookies from "js-cookie";
import ImageUploader from "@/components/upload/ImageUploader";
import TinyMCEEditor from "@/components/tinymce-editor";

type HomestayFormValues = z.infer<typeof homestaySchema>;

export default function HomestayDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNewHomestay = id === "new";
  const [homestay, setHomestay] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewHomestay);
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const [addressResults, setAddressResults] = useState<
    { id: string; address: string }[]
  >([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Homestay form
  const form = useForm<HomestayFormValues>({
    resolver: zodResolver(homestaySchema),
    defaultValues: isNewHomestay
      ? {
          name: "",
          location: [],
          address: "",
          description: "",
          price: 0,
          maxGuests: 1,
          totalRooms: 0,
          status: "ACTIVE",
          amenities: [],
          featured: false,
          allowsPartialBooking: true,
          images: [],
        }
      : undefined,
  });

  useEffect(() => {
    if (isNewHomestay) {
      setIsLoading(false);
      return;
    }

    const fetchHomestay = async () => {
      try {
        if (id) {
          const foundHomestay = await fetchHomestayData(
            id.toString(),
            form.reset
          );
          setHomestay(foundHomestay);
          setUploadedImages(foundHomestay.images || []);
        }
      } catch (error) {
        console.error("Error fetching homestay:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomestay();
  }, [id, isNewHomestay, form]);

  const debouncedSearchAddress = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setAddressResults([]);
        return;
      }

      const results = await fetchAddressResults(query);
      setAddressResults(results);
    }, 500),
    []
  );

  const searchAddress = (query: string) => {
    debouncedSearchAddress(query);
  };

  const onSubmit = async (data: HomestayFormValues) => {
    console.log("Form submitted:", data);
    try {
      if (isNewHomestay) {
        const result = await createHomestay(data);
        console.log("Homestay created successfully:", result);

        router.push("/owner/homestays");
      } else {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("User is not authenticated");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/homestays/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update homestay");
        }

        const updatedHomestay = await response.json();
        console.log("Homestay updated successfully:", updatedHomestay);

        router.push("/owner/homestays");
      }
    } catch (error) {
      console.error("Error creating homestay:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  const amenitiesList = [
    "Wifi",
    "Bể bơi",
    "Bếp",
    "Máy lạnh",
    "Bãi đỗ xe",
    "TV",
    "Máy giặt",
    "Lò sưởi",
    "Ban công",
    "BBQ",
    "Sân vườn",
    "Jacuzzi",
    "Phòng gym",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/owner/homestays">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewHomestay
            ? "Thêm homestay mới"
            : `Sửa homestay: ${homestay?.name}`}
        </h2>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
          <TabsTrigger value="images">Ảnh</TabsTrigger>
          <TabsTrigger value="amenities">Tiện ích</TabsTrigger>
          <TabsTrigger value="pricing">Giá</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Nhập thông tin cơ bản của homestay.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên homestay" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Địa chỉ</FormLabel>
                        <Popover
                          open={addressSearchOpen}
                          onOpenChange={setAddressSearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <div className="flex items-center relative">
                                <Input
                                  placeholder="Tìm kiếm địa chỉ"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    searchAddress(e.target.value);
                                  }}
                                  className="pr-10"
                                />
                                <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0 w-[400px]"
                            align="start"
                            side="bottom"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Tìm kiếm địa chỉ..."
                                onValueChange={searchAddress}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Không tìm thấy kết quả.
                                </CommandEmpty>
                                <CommandGroup>
                                  {addressResults.map((result) => (
                                    <CommandItem
                                      key={result.id}
                                      onSelect={() => {
                                        field.onChange(result.address);
                                        setAddressSearchOpen(false);
                                      }}
                                    >
                                      {result.address}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Tìm kiếm địa chỉ hoặc nhập tay
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <TinyMCEEditor
                            apiKey={
                              process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""
                            }
                            value={field.value || ""}
                            onChange={(content) => field.onChange(content)}
                            height={300}
                            folder="homestays" // Chỉ định folder cho ảnh upload
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số khách tối đa</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalRooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tổng số phòng</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="INACTIVE">
                              Không hoạt động
                            </SelectItem>
                            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Homestay nổi bật</FormLabel>
                            <FormDescription>
                              Homestay này sẽ được hiển thị trên trang chủ.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowsPartialBooking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Cho phép đặt phòng riêng lẻ</FormLabel>
                            <FormDescription>
                              Nếu được chọn, khách hàng có thể đặt phòng riêng
                              lẻ. Nếu không, chỉ có toàn bộ homestay có thể được
                              đặt.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ảnh</CardTitle>
                  <CardDescription>
                    Tải lên ảnh của homestay. Bạn có thể tải lên nhiều ảnh.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    uploadedImages={uploadedImages}
                    setUploadedImages={(images) => {
                      setUploadedImages(images);
                      form.setValue("images", images);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tiện ích</CardTitle>
                  <CardDescription>
                    Chọn các tiện ích có sẵn tại homestay này.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {amenitiesList.map((amenity) => (
                            <FormField
                              key={amenity}
                              control={form.control}
                              name="amenities"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={amenity}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(amenity)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                amenity,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== amenity
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {amenity}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Giá</CardTitle>
                  <CardDescription>
                    Đặt các chi tiết giá cho homestay này.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giá cơ bản (cho mỗi đêm cho toàn bộ homestay)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormDescription>
                          Đây là tỷ lệ cho việc đặt toàn bộ homestay. Giá phòng
                          riêng lẻ có thể được đặt trong tab Phòng.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/owner/homestays">Hủy</Link>
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isNewHomestay ? "Tạo homestay" : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
