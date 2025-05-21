"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Plus,
  Trash,
  Upload,
  Edit,
  Search,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { mockHomestays } from "@/lib/mock-data/admin";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { homestaySchema, roomSchema } from "@/lib/schema";
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
  fetchHomestayById,
  fetchHomestayData,
} from "@/lib/homestay";
import Cookies from "js-cookie";

type HomestayFormValues = z.infer<typeof homestaySchema>;
type RoomFormValues = z.infer<typeof roomSchema>;

interface HomestayDetailPageProps {
  params: {
    id: string;
  };
}

export default function HomestayDetailPage() {
  const router = useRouter();
  const params = useParams();
  const isNewHomestay = params.id === "new";
  const [homestay, setHomestay] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewHomestay);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const [addressResults, setAddressResults] = useState<
    { id: string; address: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
        }
      : undefined,
  });

  // Room form
  const roomForm = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      capacity: 1,
      status: "available",
      amenities: [],
      bedTypes: [{ type: "Double", count: 1 }],
    },
  });

  useEffect(() => {
    if (isNewHomestay) {
      setIsLoading(false);
      return;
    }

    const fetchHomestay = async () => {
      try {
        if (params?.id) {
          const foundHomestay = await fetchHomestayData(params.id, form.reset);
          setHomestay(foundHomestay);
        }
      } catch (error) {
        console.error("Error fetching homestay:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomestay();
  }, [params.id, isNewHomestay, form]);

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
  
        router.push("/admin/homestays");
      } else {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("User is not authenticated");
        }

        const response = await fetch(`/api/homestays/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update homestay");
        }

        const updatedHomestay = await response.json();
        console.log("Homestay updated successfully:", updatedHomestay);

        router.push("/admin/homestays");
      }

    } catch (error) {
      console.error("Error creating homestay:", error);
    }
  };

  const handleAddRoom = () => {
    roomForm.reset({
      name: "",
      description: "",
      price: 0,
      capacity: 1,
      status: "available",
      amenities: [],
      bedTypes: [{ type: "Double", count: 1 }],
    });
    setEditingRoom(null);
    setIsAddingRoom(true);
  };

  const handleEditRoom = (room: any) => {
    roomForm.reset({
      name: room.name,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      status: room.status,
      amenities: room.amenities || [],
      bedTypes: room.bedTypes || [{ type: "Double", count: 1 }],
    });
    setEditingRoom(room);
    setIsAddingRoom(true);
  };

  const handleDeleteRoomClick = (roomId: string) => {
    setRoomToDelete(roomId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRoom = () => {
    if (roomToDelete) {
      // In a real app, you would call an API to delete the room
      setRooms(rooms.filter((room) => room.id !== roomToDelete));
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleRoomSubmit = (data: RoomFormValues) => {
    if (editingRoom) {
      // Update existing room
      setRooms(
        rooms.map((room) =>
          room.id === editingRoom.id ? { ...room, ...data } : room
        )
      );
    } else {
      // Add new room
      const newRoom = {
        id: `room${Date.now()}`,
        ...data,
        images: ["/images/sunset-beach-villa-room-1.png"],
      };
      setRooms([...rooms, newRoom]);
    }
    setIsAddingRoom(false);
  };

  const handleAddBedType = () => {
    const currentBedTypes = roomForm.getValues().bedTypes || [];
    roomForm.setValue("bedTypes", [
      ...currentBedTypes,
      { type: "Single", count: 1 },
    ]);
  };

  const handleRemoveBedType = (index: number) => {
    const currentBedTypes = roomForm.getValues().bedTypes || [];
    if (currentBedTypes.length > 1) {
      roomForm.setValue(
        "bedTypes",
        currentBedTypes.filter((_, i) => i !== index)
      );
    }
  };

  const bedOptions = [
    "Single",
    "Twin",
    "Double",
    "Queen",
    "King",
    "Sofa Bed",
    "Bunk Bed",
  ];

  const roomStatusOptions = [
    { value: "available", label: "Available" },
    { value: "booked", label: "Booked" },
    { value: "maintenance", label: "Maintenance" },
  ];

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

  const roomAmenitiesList = [
    "Wifi",
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData to send files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Make API call to upload to S3
      // In a real app, replace with your actual API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const data = await response.json();
      setUploadProgress(100);

      // Add the new image URLs to the uploadedImages state
      const newImages = data.urls;
      setUploadedImages((prev) => [...prev, ...newImages]);

      if (homestay) {
        const updatedHomestay = {
          ...homestay,
          images: [...homestay.images, ...newImages],
        };
        
        setHomestay(updatedHomestay);
      }

      // Reset the file input
      event.target.value = "";

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error uploading images:", error);
      setIsUploading(false);
      setUploadProgress(0);
      // In a real app, show an error message to the user
      alert("Failed to upload images. Please try again.");
    }
  };

  const handleDeleteUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    // Also remove from homestay if it exists
    if (homestay) {
      const updatedImages = [...homestay.images];
      // Calculate the actual index in the homestay images array
      const homestayIndex =
        homestay.images.length - uploadedImages.length + index;
      if (homestayIndex >= 0) {
        updatedImages.splice(homestayIndex, 1);
        setHomestay({
          ...homestay,
          images: updatedImages,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/homestays">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewHomestay
            ? "Add New Homestay"
            : `Edit Homestay: ${homestay?.name}`}
        </h2>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={() => form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of the homestay.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter homestay name" {...field} />
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
                        <FormLabel>Address</FormLabel>
                        <Popover
                          open={addressSearchOpen}
                          onOpenChange={setAddressSearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <div className="flex items-center relative">
                                <Input
                                  placeholder="Search for address"
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
                                placeholder="Search address..."
                                onValueChange={searchAddress}
                              />
                              <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
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
                          Search for an address or enter it manually
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a detailed description"
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
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Guests</FormLabel>
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
                          <FormLabel>Total Rooms</FormLabel>
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
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
                            <FormLabel>Featured Homestay</FormLabel>
                            <FormDescription>
                              This homestay will be displayed on the homepage.
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
                            <FormLabel>
                              Allow Individual Room Bookings
                            </FormLabel>
                            <FormDescription>
                              If checked, guests can book individual rooms.
                              Otherwise, only the entire homestay can be booked.
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
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Upload images of the homestay. You can upload multiple
                    images.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {!isNewHomestay &&
                        homestay?.images.map((image: string, index: number) => (
                          <div
                            key={index}
                            className="relative aspect-square overflow-hidden rounded-md border"
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${homestay.name} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute right-2 top-2"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete image</span>
                            </Button>
                          </div>
                        ))}
                      {/* Display newly uploaded images */}
                      {isNewHomestay && uploadedImages.map((imageUrl, index) => (
                        <div
                          key={`uploaded-${index}`}
                          className="relative aspect-square overflow-hidden rounded-md border"
                        >
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Uploaded image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => handleDeleteUploadedImage(index)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete image</span>
                          </Button>
                        </div>
                      ))}
                      <div className="flex aspect-square items-center justify-center rounded-md border border-dashed relative">
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2 p-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-center p-4">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">Upload Image</p>
                            <p className="text-xs text-muted-foreground">
                              Drag and drop or click to upload
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id="image-upload"
                              onChange={handleImageUpload}
                            />
                            <label
                              htmlFor="image-upload"
                              className="mt-2 cursor-pointer rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                            >
                              Select Files
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Rooms</CardTitle>
                    <CardDescription>
                      Manage individual rooms within this homestay.
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleAddRoom}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </Button>
                </CardHeader>
                <CardContent>
                  {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8">
                      <p className="text-sm text-muted-foreground mb-4">
                        No rooms added yet
                      </p>
                      <Button variant="outline" onClick={handleAddRoom}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Room
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rooms.map((room) => (
                            <TableRow key={room.id}>
                              <TableCell className="font-medium">
                                {room.name}
                              </TableCell>
                              <TableCell>{room.capacity} guests</TableCell>
                              <TableCell>
                                {formatCurrency(room.price)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                    room.status
                                  )}`}
                                >
                                  {room.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditRoom(room)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteRoomClick(room.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {isAddingRoom && (
                    <div className="mt-6 border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-4">
                        {editingRoom ? "Edit Room" : "Add New Room"}
                      </h3>
                      <Form {...roomForm}>
                        <form
                          onSubmit={roomForm.handleSubmit(handleRoomSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={roomForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Room Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter room name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={roomForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter room description"
                                    className="min-h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                              control={roomForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (per night)</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={roomForm.control}
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
                          </div>

                          <FormField
                            control={roomForm.control}
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

                          <div className="space-y-2">
                            <Label>Bed Configuration</Label>
                            <div className="space-y-2">
                              {roomForm.watch("bedTypes")?.map((_, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-4"
                                >
                                  <Select
                                    value={roomForm.watch(
                                      `bedTypes.${index}.type`
                                    )}
                                    onValueChange={(value) =>
                                      roomForm.setValue(
                                        `bedTypes.${index}.type`,
                                        value
                                      )
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
                                    value={roomForm.watch(
                                      `bedTypes.${index}.count`
                                    )}
                                    onChange={(e) =>
                                      roomForm.setValue(
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

                          <FormField
                            control={roomForm.control}
                            name="amenities"
                            render={() => (
                              <FormItem>
                                <FormLabel>Room Amenities</FormLabel>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 border rounded-md p-2">
                                  {roomAmenitiesList.map((amenity) => (
                                    <FormField
                                      key={amenity}
                                      control={roomForm.control}
                                      name="amenities"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={amenity}
                                            className="flex flex-row items-start space-x-2 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(
                                                  amenity
                                                )}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([
                                                        ...field.value,
                                                        amenity,
                                                      ])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) =>
                                                            value !== amenity
                                                        )
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">
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

                          <div className="pt-4 flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddingRoom(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              {editingRoom ? "Update Room" : "Add Room"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>
                    Select the amenities available at this homestay.
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
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>
                    Set the pricing details for this homestay.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Base Price (per night for entire homestay)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the rate for booking the entire homestay.
                          Individual room prices can be set in the Rooms tab.
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
                <Link href="/admin/homestays">Cancel</Link>
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isNewHomestay ? "Create Homestay" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>

      {/* Delete Room Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              room and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRoom}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
