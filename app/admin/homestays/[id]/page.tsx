"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Plus, Trash, Upload, Edit } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { mockHomestays } from "@/lib/mock-data/admin"
import { formatCurrency, getStatusColor } from "@/lib/utils"

const homestaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  maxGuests: z.coerce.number().min(1, "Max guests must be at least 1"),
  totalRooms: z.coerce.number().min(0, "Total rooms cannot be negative"),
  status: z.string(),
  amenities: z.array(z.string()),
  featured: z.boolean().default(false),
  allowsPartialBooking: z.boolean().default(true),
})

type HomestayFormValues = z.infer<typeof homestaySchema>

// Room form schema
const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  status: z.string(),
  amenities: z.array(z.string()),
  bedTypes: z.array(
    z.object({
      type: z.string(),
      count: z.coerce.number().min(1),
    }),
  ),
})

type RoomFormValues = z.infer<typeof roomSchema>

interface HomestayDetailPageProps {
  params: {
    id: string
  }
}

export default function HomestayDetailPage({ params }: HomestayDetailPageProps) {
  const router = useRouter()
  const isNewHomestay = params.id === "new"
  const [homestay, setHomestay] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(!isNewHomestay)
  const [rooms, setRooms] = useState<any[]>([])
  const [isAddingRoom, setIsAddingRoom] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null)

  // Homestay form
  const form = useForm<HomestayFormValues>({
    resolver: zodResolver(homestaySchema),
    defaultValues: isNewHomestay
      ? {
          name: "",
          location: "",
          description: "",
          price: 0,
          maxGuests: 1,
          totalRooms: 0,
          status: "active",
          amenities: [],
          featured: false,
          allowsPartialBooking: true,
        }
      : undefined,
  })

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
  })

  useEffect(() => {
    if (isNewHomestay) {
      setIsLoading(false)
      return
    }

    // Simulate API call to fetch homestay details
    const fetchHomestay = async () => {
      try {
        // In a real app, you would fetch from an API
        const foundHomestay = mockHomestays.find((h) => h.id === params.id)

        if (foundHomestay) {
          setHomestay(foundHomestay)
          form.reset({
            name: foundHomestay.name,
            location: foundHomestay.location,
            description: foundHomestay.description,
            price: foundHomestay.price,
            maxGuests: foundHomestay.maxGuests,
            totalRooms: foundHomestay.totalRooms || 0,
            status: foundHomestay.status || "active",
            amenities: foundHomestay.amenities,
            featured: foundHomestay.featured,
            allowsPartialBooking: foundHomestay.allowsPartialBooking !== false,
          })

          // Simulate fetching rooms for this homestay
          // In a real app, you would fetch from an API
          setRooms([
            {
              id: "room1",
              name: "Deluxe King Room",
              description: "Spacious room with king-sized bed and ocean view",
              price: 120,
              capacity: 2,
              status: "available",
              amenities: ["Wi-Fi", "Air Conditioning", "Mini Bar", "Safe"],
              bedTypes: [{ type: "King", count: 1 }],
              images: ["/images/sunset-beach-villa-room-1.png", "/images/sunset-beach-villa-room-2.png"],
            },
            {
              id: "room2",
              name: "Twin Room with Balcony",
              description: "Comfortable room with two twin beds and balcony",
              price: 95,
              capacity: 2,
              status: "available",
              amenities: ["Wi-Fi", "Air Conditioning", "Tea/Coffee Maker"],
              bedTypes: [{ type: "Twin", count: 2 }],
              images: ["/images/sunset-beach-villa-room-3.png", "/images/sunset-beach-villa-room-4.png"],
            },
            {
              id: "room3",
              name: "Family Suite",
              description: "Large suite perfect for families with separate living area",
              price: 180,
              capacity: 4,
              status: "maintenance",
              amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "TV", "Balcony"],
              bedTypes: [
                { type: "King", count: 1 },
                { type: "Sofa Bed", count: 1 },
              ],
              images: ["/images/sunset-beach-villa-room-5.png", "/images/sunset-beach-villa-room-6.png"],
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching homestay:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomestay()
  }, [params.id, isNewHomestay, form])

  const onSubmit = (data: HomestayFormValues) => {
    // In a real app, you would submit to an API
    console.log("Form submitted:", data)

    // Simulate successful submission
    setTimeout(() => {
      router.push("/admin/homestays")
    }, 1000)
  }

  const handleAddRoom = () => {
    roomForm.reset({
      name: "",
      description: "",
      price: 0,
      capacity: 1,
      status: "available",
      amenities: [],
      bedTypes: [{ type: "Double", count: 1 }],
    })
    setEditingRoom(null)
    setIsAddingRoom(true)
  }

  const handleEditRoom = (room: any) => {
    roomForm.reset({
      name: room.name,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      status: room.status,
      amenities: room.amenities || [],
      bedTypes: room.bedTypes || [{ type: "Double", count: 1 }],
    })
    setEditingRoom(room)
    setIsAddingRoom(true)
  }

  const handleDeleteRoomClick = (roomId: string) => {
    setRoomToDelete(roomId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRoom = () => {
    if (roomToDelete) {
      // In a real app, you would call an API to delete the room
      setRooms(rooms.filter((room) => room.id !== roomToDelete))
      setIsDeleteDialogOpen(false)
      setRoomToDelete(null)
    }
  }

  const handleRoomSubmit = (data: RoomFormValues) => {
    if (editingRoom) {
      // Update existing room
      setRooms(rooms.map((room) => (room.id === editingRoom.id ? { ...room, ...data } : room)))
    } else {
      // Add new room
      const newRoom = {
        id: `room${Date.now()}`,
        ...data,
        images: ["/images/sunset-beach-villa-room-1.png"],
      }
      setRooms([...rooms, newRoom])
    }
    setIsAddingRoom(false)
  }

  const handleAddBedType = () => {
    const currentBedTypes = roomForm.getValues().bedTypes || []
    roomForm.setValue("bedTypes", [...currentBedTypes, { type: "Single", count: 1 }])
  }

  const handleRemoveBedType = (index: number) => {
    const currentBedTypes = roomForm.getValues().bedTypes || []
    if (currentBedTypes.length > 1) {
      roomForm.setValue(
        "bedTypes",
        currentBedTypes.filter((_, i) => i !== index),
      )
    }
  }

  const bedOptions = ["Single", "Twin", "Double", "Queen", "King", "Sofa Bed", "Bunk Bed"]

  const roomStatusOptions = [
    { value: "available", label: "Available" },
    { value: "booked", label: "Booked" },
    { value: "maintenance", label: "Maintenance" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    )
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
  ]

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
  ]

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
          {isNewHomestay ? "Add New Homestay" : `Edit Homestay: ${homestay?.name}`}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of the homestay.</CardDescription>
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
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
                          <Textarea placeholder="Enter a detailed description" className="min-h-32" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Homestay</FormLabel>
                            <FormDescription>This homestay will be displayed on the homepage.</FormDescription>
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allow Individual Room Bookings</FormLabel>
                            <FormDescription>
                              If checked, guests can book individual rooms. Otherwise, only the entire homestay can be
                              booked.
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
                  <CardDescription>Upload images of the homestay. You can upload multiple images.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {!isNewHomestay &&
                        homestay?.images.map((image: string, index: number) => (
                          <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${homestay.name} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button variant="destructive" size="icon" className="absolute right-2 top-2">
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete image</span>
                            </Button>
                          </div>
                        ))}
                      <div className="flex aspect-square items-center justify-center rounded-md border border-dashed">
                        <div className="flex flex-col items-center gap-1 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Upload Image</p>
                          <p className="text-xs text-muted-foreground">Drag and drop or click to upload</p>
                          <Input type="file" accept="image/*" className="hidden" id="image-upload" />
                          <label
                            htmlFor="image-upload"
                            className="mt-2 cursor-pointer rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                          >
                            Select File
                          </label>
                        </div>
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
                    <CardDescription>Manage individual rooms within this homestay.</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleAddRoom}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </Button>
                </CardHeader>
                <CardContent>
                  {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8">
                      <p className="text-sm text-muted-foreground mb-4">No rooms added yet</p>
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
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rooms.map((room) => (
                            <TableRow key={room.id}>
                              <TableCell className="font-medium">{room.name}</TableCell>
                              <TableCell>{room.capacity} guests</TableCell>
                              <TableCell>{formatCurrency(room.price)}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                    room.status,
                                  )}`}
                                >
                                  {room.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditRoom(room)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRoomClick(room.id)}>
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
                      <h3 className="text-lg font-medium mb-4">{editingRoom ? "Edit Room" : "Add New Room"}</h3>
                      <Form {...roomForm}>
                        <form onSubmit={roomForm.handleSubmit(handleRoomSubmit)} className="space-y-4">
                          <FormField
                            control={roomForm.control}
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
                            control={roomForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter room description" className="min-h-20" {...field} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {roomStatusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
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
                                <div key={index} className="flex items-center gap-4">
                                  <Select
                                    value={roomForm.watch(`bedTypes.${index}.type`)}
                                    onValueChange={(value) => roomForm.setValue(`bedTypes.${index}.type`, value)}
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
                                    value={roomForm.watch(`bedTypes.${index}.count`)}
                                    onChange={(e) =>
                                      roomForm.setValue(`bedTypes.${index}.count`, Number.parseInt(e.target.value) || 1)
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
                              <Button type="button" variant="outline" size="sm" onClick={handleAddBedType}>
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
                                                checked={field.value?.includes(amenity)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value, amenity])
                                                    : field.onChange(field.value?.filter((value) => value !== amenity))
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">{amenity}</FormLabel>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddingRoom(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">{editingRoom ? "Update Room" : "Add Room"}</Button>
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
                  <CardDescription>Select the amenities available at this homestay.</CardDescription>
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
                                  <FormItem key={amenity} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(amenity)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, amenity])
                                            : field.onChange(field.value?.filter((value) => value !== amenity))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{amenity}</FormLabel>
                                  </FormItem>
                                )
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
                  <CardDescription>Set the pricing details for this homestay.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (per night for entire homestay)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the rate for booking the entire homestay. Individual room prices can be set in the
                          Rooms tab.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Special Pricing</Label>
                    <div className="rounded-md border">
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">Weekend Pricing</p>
                          <p className="text-sm text-muted-foreground">Set different rates for weekends</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      <div className="flex items-center justify-between border-t p-4">
                        <div>
                          <p className="font-medium">Seasonal Pricing</p>
                          <p className="text-sm text-muted-foreground">Set different rates for specific seasons</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      <div className="flex items-center justify-between border-t p-4">
                        <div>
                          <p className="font-medium">Promotional Pricing</p>
                          <p className="text-sm text-muted-foreground">Set promotional rates for specific dates</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label>Pricing Strategy</Label>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Dynamic Pricing</p>
                              <p className="text-xs text-muted-foreground">
                                Automatically adjust prices based on demand
                              </p>
                            </div>
                            <Checkbox />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Length of Stay Discounts</p>
                              <p className="text-xs text-muted-foreground">Offer discounts for longer stays</p>
                            </div>
                            <Checkbox defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Room Bundle Discounts</p>
                              <p className="text-xs text-muted-foreground">Discount when booking multiple rooms</p>
                            </div>
                            <Checkbox />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRoom} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
