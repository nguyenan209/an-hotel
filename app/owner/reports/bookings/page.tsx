"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2025");
  const [bookingStats, setBookingStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/bookings?year=${year}`);
        const data = await res.json();
        setBookingStats(data.stats || null);
      } catch (e) {
        setBookingStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [year]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">Loading booking stats...</p>
      </div>
    );
  }
  if (!bookingStats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg text-red-500">Failed to load booking stats.</p>
      </div>
    );
  }

  // Tính maxBookings cho chart
  const maxBookings = Math.max(...bookingStats.monthlyStats.map((s: { bookings: number }) => s.bookings));

  // Hàm scale chiều cao cột: tỉ lệ tuyệt đối
  const getBarHeight = (bookings: number) => {
    if (maxBookings === 0) return '0%';
    return `${(bookings / maxBookings) * 100}%`;
  };

  // Log dữ liệu chart để debug
  console.log('monthlyStats', bookingStats.monthlyStats);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Booking Reports</h2>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.total}</div>
            <p className="text-xs text-muted-foreground">For the year {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingStats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.total > 0 ? Math.round((bookingStats.completed / bookingStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingStats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.total > 0 ? Math.round((bookingStats.cancelled / bookingStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="source">By Source</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
              <CardDescription>
                Monthly booking statistics for the year {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] pt-8 pb-4 border border-muted-foreground/10 rounded-lg">
              <div className="h-full w-full flex flex-col justify-end">
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {bookingStats.monthlyStats.map((item: { month: string; bookings: number }, index: number) => (
                      <div key={index} className="relative flex-1 h-full">
                        <div
                          className={`absolute bottom-0 w-full rounded-md border ${item.bookings > 0 ? 'bg-pink-500 border-pink-700' : 'bg-muted-foreground/20 border-muted-foreground/30'}`}
                          style={{
                            height: getBarHeight(item.bookings),
                            minHeight: item.bookings === 0 ? 4 : undefined,
                          }}
                        />
                        {item.bookings > 0 && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 mb-1 text-xs font-medium"
                            style={{
                              bottom: `calc(${getBarHeight(item.bookings)} + 4px)`
                            }}
                          >
                            {item.bookings}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {bookingStats.monthlyStats.map((item: { month: string; bookings: number }, index: number) => (
                      <div key={index} className="flex-1 text-center">
                        {item.month}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>
                Detailed monthly booking analysis for {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingStats.monthlyStats.map((item: { month: string; bookings: number }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 text-muted-foreground">
                        {item.month}
                      </div>
                      <div className="w-full max-w-md">
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${
                                maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 4
                              }%`,
                              minWidth: 4,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">{item.bookings} bookings</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>By Status</CardTitle>
              <CardDescription>
                Booking distribution by status for {year}
              </CardDescription>
            </CardHeader>
            <CardContent>{/* Add status-based statistics here */}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>By Source</CardTitle>
              <CardDescription>
                Booking distribution by source for {year}
              </CardDescription>
            </CardHeader>
            <CardContent>{/* Add source-based statistics here */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
