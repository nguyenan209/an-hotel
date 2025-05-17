"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Plus, Trash, Upload } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { getHomestays } from "@/lib/data"

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  homestayId: z.string().min(1, "Homestay is required"),
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

interface RoomDetailPageProps {
  params: {
    id: string
  }
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  const router = useRouter()
  const isNewRoom = params.id === "new"
  const [room, setRoom] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(!isNewRoom)
  const [homestays, setHomestays] = useState<any[]>([])

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: isNewRoom
      ? {
          name: "",
          description: "",
          homestayId: "",
          price: 0,
          capacity: 1,
          status: "available",
          amenities: [],
          bedTypes: [{ type: "Double", count: 1 }],
        }
      : undefined,
  })

  useEffect(() => {
    // Fetch homestays for the select dropdown
    const fetchHomestays = async () => {
      try {
        const homestaysData = await getHomestays()
        setHomestays(homestaysData)
      } catch (error) {
        console.error("Error fetching homestays:", error)
      }
    }

    fetchHomestays()

    if (isNewRoom) {
      setIsLoading(false)
      return
    }

    // Simulate API call to fetch room details
    const fetchRoom = async () => {
      try {
        // In a real app, you would fetch from an API
        const mockRoom = {
          id: params.id,
          name: "Deluxe King Room",
          description: "Spacious room with king-sized bed and ocean view",
          homestayId: "homestay-1",
          price: 120,
          capacity: 2,
          status: "available",
          amenities: ["Wi-Fi", "Air Conditioning", "Mini Bar", "Safe"],
          bedTypes: [{ type: "King", count: 1 }],
          images: ["/images/sunset-beach-villa-room-1.png", "/images/sunset-beach-villa-room-2.png"],
        }

        setRoom(mockRoom)
        form.reset({
          name: mockRoom.name,
          description: mockRoom.description,
          homestayId: mockRoom.homestayId,
          price: mockRoom.price,
          capacity: mockRoom.capacity,
          status: mockRoom.status,
          amenities: mockRoom.amenities,
          bedTypes: mockRoom.bedTypes,
        })
      } catch (error) {
        console.error("Error fetching room:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoom()
  }, [params.id, isNewRoom, form])

  const onSubmit = (data: RoomFormValues) => {
    // In a real app, you would submit to an API
    console.log("Form submitted:", data)

    // Simulate successful submission
    setTimeout(() => {
      router.push("/admin/rooms")
    }, 1000)
  }

  const handleAddBedType = () => {
    const currentBedTypes = form.getValues().bedTypes || []
    form.setValue("bedTypes", [...currentBedTypes, { type: "Single", count: 1 }])
  }

  const handleRemoveBedType = (index: number) => {
    const currentBedTypes = form.getValues().bedTypes || []
    if (currentBedTypes.length > 1) {
      form.setValue(
        "bedTypes",
        currentBedTypes.filter((_, i) => i !== index),
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  const bedOptions = ["Single", "Twin", "Double", "Queen", "King", "Sofa Bed", "Bunk Bed"]

  const roomStatusOptions = [
    { value: "available", label: "Available" },
    { value: "booked", label: "Booked" },
    { value: "maintenance", label: "Maintenance" },
  ]

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
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/rooms">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{isNewRoom ? "Add New Room" : `Edit Room: ${room?.name}`}</h2>
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
                  <CardDescription>Enter the basic details of the room.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="homestayId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Homestay</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select homestay" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {homestays.map((homestay) => (
                              <SelectItem key={homestay.id} value={homestay.id}>
                                {homestay.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The homestay this room belongs to.</FormDescription>
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
                          <Textarea placeholder="Enter room description" className="min-h-32" {...field} />
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
                  </div>

                  <div className="space-y-2">
                    <Label>Bed Configuration</Label>
                    <div className="space-y-2">
                      {form.watch("bedTypes")?.map((_, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Select
                            value={form.watch(`bedTypes.${index}.type`)}
                            onValueChange={(value) => form.setValue(`bedTypes.${index}.type`, value)}
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
                              form.setValue(`bedTypes.${index}.count`, Number.parseInt(e.target.value) || 1)
                            }
                            className="w-24"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBedType(index)}>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room Images</CardTitle>
                  <CardDescription>Upload images of the room. You can upload multiple images.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {!isNewRoom &&
                        room?.images.map((image: string, index: number) => (
                          <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${room.name} - Image ${index + 1}`}
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

            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room Amenities</CardTitle>
                  <CardDescription>Select the amenities available in this room.</CardDescription>
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
                  <CardTitle>Room Pricing</CardTitle>
                  <CardDescription>Set the pricing details for this room.</CardDescription>
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
                        <FormDescription>This is the standard rate for this room per night.</FormDescription>
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
  )
}
