"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ApprovalDetailPageProps {
  params: {
    id: string;
  };
}

export default function ApprovalDetailPage({
  params,
}: ApprovalDetailPageProps) {
  const [status, setStatus] = useState("pending");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for the homestay approval
  const homestay = {
    id: params.id,
    name: "Sunset Beach Villa",
    description:
      "A beautiful beachfront villa with stunning sunset views. Perfect for family vacations or romantic getaways. Features a private pool, direct beach access, and modern amenities.",
    location: "Đà Nẵng",
    address: "123 Beach Road, Đà Nẵng",
    price: 2500000,
    maxGuests: 8,
    totalRooms: 4,
    amenities: [
      "Wifi",
      "Bể bơi",
      "Bếp",
      "Máy lạnh",
      "Bãi đỗ xe",
      "TV",
      "Máy giặt",
      "Ban công",
      "BBQ",
      "Sân vườn",
    ],
    images: [
      "/images/sunset-beach-villa-1.png",
      "/images/sunset-beach-villa-2.png",
      "/images/sunset-beach-villa-3.png",
      "/images/sunset-beach-villa-room-1.png",
      "/images/sunset-beach-villa-room-2.png",
      "/images/sunset-beach-villa-room-3.png",
    ],
    rooms: [
      {
        id: "room1",
        name: "Master Suite",
        description:
          "Spacious master bedroom with en-suite bathroom and ocean view",
        price: 1000000,
        capacity: 2,
        images: [
          "/images/sunset-beach-villa-room-1.png",
          "/images/sunset-beach-villa-room-2.png",
        ],
      },
      {
        id: "room2",
        name: "Guest Room 1",
        description: "Comfortable guest room with queen bed and garden view",
        price: 800000,
        capacity: 2,
        images: [
          "/images/sunset-beach-villa-room-3.png",
          "/images/sunset-beach-villa-room-4.png",
        ],
      },
      {
        id: "room3",
        name: "Guest Room 2",
        description: "Cozy guest room with twin beds",
        price: 700000,
        capacity: 2,
        images: [
          "/images/sunset-beach-villa-room-5.png",
          "/images/sunset-beach-villa-room-6.png",
        ],
      },
      {
        id: "room4",
        name: "Kids Room",
        description: "Fun room with bunk beds, perfect for children",
        price: 500000,
        capacity: 2,
        images: [
          "/images/sunset-beach-villa-room-1.png",
          "/images/sunset-beach-villa-room-2.png",
        ],
      },
    ],
    owner: {
      id: "own1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      joinDate: "2023-01-15T10:30:00Z",
      status: "active",
    },
    submittedDate: "2023-05-15T10:30:00Z",
    status: "pending",
  };

  const handleApprove = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to approve the homestay
    setTimeout(() => {
      setStatus("approved");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      alert("Please provide feedback for rejection");
      return;
    }

    setIsSubmitting(true);
    // In a real app, you would call an API to reject the homestay
    setTimeout(() => {
      setStatus("rejected");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/approvals">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{homestay.name}</h2>
          <p className="text-muted-foreground">
            Submitted by{" "}
            <Link
              href={`/admin/owners/${homestay.owner.id}`}
              className="text-blue-600 hover:underline"
            >
              {homestay.owner.name}
            </Link>{" "}
            on {formatDate(homestay.submittedDate)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            className={
              status === "approved"
                ? "bg-green-100 text-green-800"
                : status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homestay Information</CardTitle>
              <CardDescription>
                Review the basic details of the homestay.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Name
                  </h3>
                  <p className="text-base">{homestay.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Location
                  </h3>
                  <p className="text-base">{homestay.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Address
                  </h3>
                  <p className="text-base">{homestay.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Price (per night)
                  </h3>
                  <p className="text-base">
                    {homestay.price.toLocaleString()} VND
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Maximum Guests
                  </h3>
                  <p className="text-base">{homestay.maxGuests} guests</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Rooms
                  </h3>
                  <p className="text-base">{homestay.totalRooms} rooms</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="text-base mt-1">{homestay.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {homestay.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
              <CardDescription>
                Review the rooms available in this homestay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {homestay.rooms.map((room) => (
                  <div key={room.id} className="rounded-lg border p-4">
                    <div className="aspect-video relative mb-3 overflow-hidden rounded-md">
                      <Image
                        src={room.images[0] || "/placeholder.svg"}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-medium">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {room.description}
                    </p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm font-medium">
                        {room.price.toLocaleString()} VND / night
                      </span>
                      <span className="text-sm">{room.capacity} guests</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homestay Images</CardTitle>
              <CardDescription>
                Review the images uploaded for this homestay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {homestay.images.map((image, index) => (
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
              <CardDescription>
                Review the details of the homestay owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Name
                  </h3>
                  <p className="text-base">{homestay.owner.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p className="text-base">{homestay.owner.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Phone
                  </h3>
                  <p className="text-base">{homestay.owner.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Join Date
                  </h3>
                  <p className="text-base">
                    {formatDate(homestay.owner.joinDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h3>
                  <Badge
                    className={
                      homestay.owner.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {homestay.owner.status.charAt(0).toUpperCase() +
                      homestay.owner.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Decision</CardTitle>
            <CardDescription>
              Approve or reject this homestay listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="feedback" className="text-sm font-medium">
                Feedback (required for rejection)
              </label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback to the owner..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
