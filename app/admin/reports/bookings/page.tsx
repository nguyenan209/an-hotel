"use client";

import { useState } from "react";
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
import { mockBookingStats } from "@/lib/mock-data/admin";

export default function BookingReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2023");

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
            <div className="text-2xl font-bold">{mockBookingStats.total}</div>
            <p className="text-xs text-muted-foreground">For the year {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockBookingStats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (mockBookingStats.completed / mockBookingStats.total) * 100
              )}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockBookingStats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (mockBookingStats.cancelled / mockBookingStats.total) * 100
              )}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBookingStats.pending}</div>
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
            <CardContent className="h-[400px]">
              <div className="h-full w-full">
                {/* This would be a chart in a real implementation */}
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {mockBookingStats.monthlyStats.map((item, index) => (
                      <div key={index} className="relative flex-1">
                        <div
                          className="absolute bottom-0 w-full rounded-md bg-primary"
                          style={{
                            height: `${
                              (item.bookings /
                                Math.max(
                                  ...mockBookingStats.monthlyStats.map(
                                    (s) => s.bookings
                                  )
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {mockBookingStats.monthlyStats.map((item, index) => (
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
                {mockBookingStats.monthlyStats.map((item, index) => (
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
                                (item.bookings /
                                  Math.max(
                                    ...mockBookingStats.monthlyStats.map(
                                      (s) => s.bookings
                                    )
                                  )) *
                                100
                              }%`,
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
