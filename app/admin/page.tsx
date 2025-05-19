"use client";

import { useState } from "react";
import { BarChart3, Hotel, ShoppingCart, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

// Import chart components
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Page() {
  const [dateRange, setDateRange] = useState("7d");

  // Mock data for the dashboard
  const stats = {
    totalRevenue: 125000000,
    totalBookings: 87,
    totalCustomers: 64,
    totalHomestays: 42,
    pendingApprovals: 5,
    openComplaints: 3,
    pendingReviews: 8,
  };

  // Mock data for the revenue chart
  const revenueData = [
    { name: "Mon", revenue: 5000000 },
    { name: "Tue", revenue: 7000000 },
    { name: "Wed", revenue: 6500000 },
    { name: "Thu", revenue: 8000000 },
    { name: "Fri", revenue: 12000000 },
    { name: "Sat", revenue: 15000000 },
    { name: "Sun", revenue: 10000000 },
  ];

  // Mock data for the bookings chart
  const bookingsData = [
    { name: "Mon", bookings: 5 },
    { name: "Tue", bookings: 8 },
    { name: "Wed", bookings: 6 },
    { name: "Thu", bookings: 9 },
    { name: "Fri", bookings: 12 },
    { name: "Sat", bookings: 15 },
    { name: "Sun", bookings: 10 },
  ];

  // Mock data for the homestay types chart
  const homestayTypesData = [
    { name: "Beach", value: 15 },
    { name: "Mountain", value: 10 },
    { name: "City", value: 8 },
    { name: "Countryside", value: 5 },
    { name: "Lakeside", value: 4 },
  ];

  // Mock data for recent bookings
  const recentBookings = [
    {
      id: "book123",
      customerName: "Lê Minh",
      homestayName: "Sunset Beach Villa",
      checkIn: "2023-06-20",
      checkOut: "2023-06-25",
      total: 12500000,
      status: "confirmed",
    },
    {
      id: "book124",
      customerName: "Trần Hoa",
      homestayName: "Mountain Retreat Lodge",
      checkIn: "2023-06-22",
      checkOut: "2023-06-24",
      total: 3600000,
      status: "pending",
    },
    {
      id: "book125",
      customerName: "Nguyễn Thành",
      homestayName: "Riverside Cottage",
      checkIn: "2023-06-25",
      checkOut: "2023-06-30",
      total: 7500000,
      status: "confirmed",
    },
    {
      id: "book126",
      customerName: "Phạm Linh",
      homestayName: "City Center Apartment",
      checkIn: "2023-06-21",
      checkOut: "2023-06-23",
      total: 3000000,
      status: "completed",
    },
  ];

  // Mock data for pending approvals
  const pendingApprovals = [
    {
      id: "hs1",
      name: "Sunset Beach Villa",
      ownerName: "Nguyễn Văn A",
      location: "Đà Nẵng",
      submittedDate: "2023-06-15",
    },
    {
      id: "hs2",
      name: "Mountain Retreat Lodge",
      ownerName: "Trần Thị B",
      location: "Sapa",
      submittedDate: "2023-06-16",
    },
    {
      id: "hs3",
      name: "Riverside Cottage",
      ownerName: "Lê Văn C",
      location: "Hội An",
      submittedDate: "2023-06-14",
    },
  ];

  // Mock data for open complaints
  const openComplaints = [
    {
      id: "comp1",
      subject: "Phòng không sạch sẽ",
      customerName: "Lê Minh",
      homestayName: "Sunset Beach Villa",
      priority: "high",
      createdAt: "2023-06-15",
    },
    {
      id: "comp4",
      subject: "Vấn đề về thanh toán",
      customerName: "Phạm Linh",
      homestayName: "City Center Apartment",
      priority: "high",
      createdAt: "2023-06-17",
    },
  ];

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue="7d"
            className="w-[400px]"
            onValueChange={setDateRange}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
              <TabsTrigger value="90d">90d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Homestays
            </CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHomestays}</div>
            <p className="text-xs text-muted-foreground">
              +4.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Revenue trend for the last {dateRange}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(value as number)
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
