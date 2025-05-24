"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Plus, Trash, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { HomestayCombobox } from "@/components/homestay/homestay-compobox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { roomSchema } from "@/lib/schema";
import ImageUploader from "@/components/upload/ImageUploader";
import { BedType, RoomStatus } from "@prisma/client";

type RoomFormValues = z.infer<typeof roomSchema>;

export default function RoomDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNewRoom = id === "new";
  const [room, setRoom] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewRoom);
  const [homestays, setHomestays] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: isNewRoom
      ? {
          name: "",
          description: "",
          homestayId: "",
          price: 0,
          capacity: 1,
          status: RoomStatus.AVAILABLE,
          amenities: [],
          bedTypes: [{ type: BedType.DOUBLE, count: 1 }],
          images: [],
        }
      : undefined,
  });

  const fetchHomestays = async (searchQuery = "") => {
    try {
      const response = await fetch(
        `/api/admin/homestays?search=${searchQuery}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch homestays");
      }
      const homestaysData = await response.json();
      setHomestays(homestaysData.homestays);
    } catch (error) {
      console.error("Error fetching homestays:", error);
    }
  };

  useEffect(() => {
    if (isNewRoom) {
      setIsLoading(false);
      return;
    }

    // Simulate API call to fetch room details
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room");
        }

        const roomData = await response.json();

        setRoom(roomData);
        setUploadedImages(roomData.images || []);
        form.reset({
          name: roomData.name,
          description: roomData.description,
          homestayId: roomData.homestayId,
          price: roomData.price,
          capacity: roomData.capacity,
          status: roomData.status,
          amenities: roomData.amenities,
          bedTypes: roomData.beds.map((bed: any) => ({
            type: bed.type,
            count: bed.count,
          })),
          images: roomData.images,
        });
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, isNewRoom, form]);

  const onSubmit = (data: RoomFormValues) => {
    const createOrUpdateRoom = async () => {
      try {
        const url = isNewRoom ? "/api/rooms" : `/api/rooms/${id}`;
        const method = isNewRoom ? "POST" : "PUT";

        // Chuẩn hóa dữ liệu images
        const formattedData = {
          ...data,
          images: uploadedImages.map((image) => image), // Chỉ lấy URL
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          throw new Error("Failed to save room");
        }

        const result = await response.json();
        console.log("Room saved successfully:", result);
      } catch (error) {
        console.error("Error saving room:", error);
      }
    };

    createOrUpdateRoom();

    // Simulate successful submission
    setTimeout(() => {
      router.push("/admin/rooms");
    }, 1000);
  };

  const handleAddBedType = () => {
    const currentBedTypes = form.getValues().bedTypes || [];
    form.setValue("bedTypes", [
      ...currentBedTypes,
      { type: BedType.SINGLE, count: 1 },
    ]);
  };

  const handleRemoveBedType = (index: number) => {
    const currentBedTypes = form.getValues().bedTypes || [];
    if (currentBedTypes.length > 1) {
      form.setValue(
        "bedTypes",
        currentBedTypes.filter((_, i) => i !== index)
      );
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHomestays(searchQuery); // Gọi API sau khi người dùng ngừng nhập
    }, 500); // Debounce 500ms

    return () => clearTimeout(delayDebounceFn); // Xóa timeout nếu người dùng tiếp tục nhập
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  const bedOptions = [
    "SINGLE",
    "TWIN",
    "DOUBLE",
    "QUEEN",
    "KING",
    "SOFA_BED",
    "BUNK_BED",
  ];

  const roomStatusOptions = [
    { value: "AVAILABLE", label: "Available" },
    { value: "BOOKED", label: "Booked" },
    { value: "MAINTENANCE", label: "Maintenance" },
  ];

  const roomAmenitiesList = [
    "Wi-Fi",
    "Air Conditioning",
    "TV",
    "Mini Bar",
    "Safe",
    "Desk",
    "Hairdryer",
    "Iron",
    "Tea/Coffee Maker",
    "Bathtub",
    "Shower",
    "Balcony",
    "Sea View",
    "Mountain View",
    "Garden View",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/rooms">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewRoom ? "Add New Room" : `Edit Room: ${room?.name}`}
        </h2>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of the room.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="homestayId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Homestay</FormLabel>
                        <FormControl>
                          {isNewRoom ? (
                            <HomestayCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select homestay"
                              showAllOption={false}
                            />
                          ) : (
                            <div className="p-2 border rounded-md bg-gray-100">
                              {homestays.find(
                                (homestay) => homestay.id === field.value
                              )?.name || "Unknown Homestay"}
                            </div>
                          )}
                        </FormControl>
                        <FormDescription>
                          {isNewRoom
                            ? "Select the homestay this room belongs to."
                            : "This room belongs to the selected homestay."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter room name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter room description"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity (guests)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roomStatusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bed Configuration</Label>
                    <div className="space-y-2">
                      {form.watch("bedTypes")?.map((_, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Select
                            value={form.watch(`bedTypes.${index}.type`)}
                            onValueChange={(value: BedType) =>
                              form.setValue(`bedTypes.${index}.type`, value)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Bed type" />
                            </SelectTrigger>
                            <SelectContent>
                              {bedOptions.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="1"
                            value={form.watch(`bedTypes.${index}.count`)}
                            onChange={(e) =>
                              form.setValue(
                                `bedTypes.${index}.count`,
                                Number.parseInt(e.target.value) || 1
                              )
                            }
                            className="w-24"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBedType(index)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddBedType}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Bed Type
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room Images</CardTitle>
                  <CardDescription>
                    Upload images of the room. You can upload multiple images.
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
                  <CardTitle>Room Amenities</CardTitle>
                  <CardDescription>
                    Select the amenities available in this room.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {roomAmenitiesList.map((amenity) => (
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
                                                ...field.value,
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
                  <CardTitle>Room Pricing</CardTitle>
                  <CardDescription>
                    Set the pricing details for this room.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (per night)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the standard rate for this room per night.
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
                <Link href="/admin/rooms">Cancel</Link>
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isNewRoom ? "Create Room" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
