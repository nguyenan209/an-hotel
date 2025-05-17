"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Edit, Home, Hotel, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, getStatusColor } from "@/lib/utils"
import { mockBookings } from "@/lib/mock-data/admin"

// Update mock bookings to include booking type
const updatedMockBookings = mockBookings.map((booking, index) => ({
  ...booking,
  bookingType: index % 3 === 0 ? "rooms" : "whole",
  rooms:
    index % 3 === 0
      ? [
          { roomId: "1-1", roomName: "Master Suite", price: 500000 },
          { roomId: "1-2", roomName: "Deluxe Room", price: 400000 },
        ]
      : undefined,
}))

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bookingTypeFilter, setBookingTypeFilter] = useState("all")

  // Filter bookings based on search query, status filter, and booking type filter
  const filteredBookings = updatedMockBookings.filter((booking) => {
    const matchesSearch =
      booking.homestayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesBookingType = bookingTypeFilter === "all" || booking.bookingType === bookingTypeFilter

    return matchesSearch && matchesStatus && matchesBookingType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        <Link href="/admin/bookings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Booking
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Bookings</CardTitle>
          <CardDescription>You have a total of {updatedMockBookings.length} bookings in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by booking type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="whole">Whole Homestay</SelectItem>
                  <SelectItem value="rooms">Individual Rooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Homestay</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Check-in / Check-out</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>{booking.homestayName}</TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.checkIn} - {booking.checkOut}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.bookingType === "whole" ? (
                          <div className="flex items-center">
                            <Home className="mr-1 h-4 w-4" />
                            <span>Whole</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Hotel className="mr-1 h-4 w-4" />
                            <span>
                              {booking.rooms?.length || 0} {booking.rooms?.length === 1 ? "Room" : "Rooms"}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
