"use client"

import { useState } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockRoomUsageStats } from "@/lib/mock-data/admin"

export default function RoomUsageReportPage() {
  const [timeRange, setTimeRange] = useState("year")
  const [year, setYear] = useState("2023")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Room Usage Reports</h2>
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
            <CardTitle className="text-sm font-medium">Total Homestays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoomUsageStats.totalHomestays}</div>
            <p className="text-xs text-muted-foreground">In the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Homestays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoomUsageStats.activeHomestays}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockRoomUsageStats.activeHomestays / mockRoomUsageStats.totalHomestays) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoomUsageStats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Average for {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Stay Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoomUsageStats.averageStayDuration} days</div>
            <p className="text-xs text-muted-foreground">Per booking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="occupancy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="homestays">Homestays</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate</CardTitle>
              <CardDescription>Monthly occupancy rate for the year {year}</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full">
                {/* This would be a chart in a real implementation */}
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {mockRoomUsageStats.monthlyOccupancy.map((item, index) => (
                      <div key={index} className="relative flex-1">
                        <div
                          className="absolute bottom-0 w-full rounded-md bg-primary"
                          style={{
                            height: `${item.rate}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {mockRoomUsageStats.monthlyOccupancy.map((item, index) => (
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
        <TabsContent value="homestays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homestay Status</CardTitle>
              <CardDescription>Current status of all homestays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-primary">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{mockRoomUsageStats.activeHomestays}</span>
                    <span className="block text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-sm font-medium">{mockRoomUsageStats.activeHomestays}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${(mockRoomUsageStats.activeHomestays / mockRoomUsageStats.totalHomestays) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Maintenance</span>
                      <span className="text-sm font-medium">{mockRoomUsageStats.maintenanceHomestays}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width: `${(mockRoomUsageStats.maintenanceHomestays / mockRoomUsageStats.totalHomestays) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inactive</span>
                      <span className="text-sm font-medium">{mockRoomUsageStats.inactiveHomestays}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{
                          width: `${(mockRoomUsageStats.inactiveHomestays / mockRoomUsageStats.totalHomestays) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Trends</CardTitle>
              <CardDescription>Occupancy rate by season for {year}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="mb-2 text-lg font-medium">High Season (Jun-Aug)</h3>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: "88%",
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Occupancy</span>
                    <span className="font-medium">88%</span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Shoulder Season (Apr-May, Sep-Oct)</h3>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: "75%",
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Occupancy</span>
                    <span className="font-medium">75%</span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Low Season (Nov-Mar)</h3>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: "65%",
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Occupancy</span>
                    <span className="font-medium">65%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
