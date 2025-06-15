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

export default function RoomUsageReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2025");
  const [roomUsageStats, setRoomUsageStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/room-usage?year=${year}`);
        const data = await res.json();
        setRoomUsageStats(data.stats || null);
      } catch (e) {
        setRoomUsageStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [year]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">Loading room usage stats...</p>
      </div>
    );
  }
  if (!roomUsageStats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg text-red-500">Failed to load room usage stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Room Usage Reports
        </h2>
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
              Total Homestays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomUsageStats.totalHomestays}
            </div>
            <p className="text-xs text-muted-foreground">In the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Homestays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomUsageStats.activeHomestays}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (roomUsageStats.activeHomestays /
                  roomUsageStats.totalHomestays) *
                  100
              )}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomUsageStats.occupancyRate}%
            </div>
            <p className="text-xs text-muted-foreground">Average for {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Stay Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomUsageStats.averageStayDuration} days
            </div>
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
              <CardDescription>
                Monthly occupancy rate for the year {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full">
                {/* This would be a chart in a real implementation */}
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {roomUsageStats.monthlyOccupancy.every((item: { rate: number }) => item.rate === 0) ? (
                      <div className="w-full text-center text-muted-foreground mt-10">No occupancy data for this year.</div>
                    ) : (
                      roomUsageStats.monthlyOccupancy.map((item: { month: string; rate: number }, index: number) => (
                        <div key={index} className="relative flex-1 h-full">
                          <div
                            className={`absolute bottom-0 w-full rounded-md border ${item.rate > 0 ? 'bg-pink-500 border-pink-700' : 'bg-muted-foreground/20 border-muted-foreground/30'}`}
                            style={{
                              height: `${item.rate}%`,
                              minHeight: item.rate === 0 ? 4 : undefined,
                            }}
                          />
                          {item.rate > 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 mb-1 text-xs font-medium" style={{ bottom: `calc(${item.rate}% + 4px)` }}>{item.rate}%</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {roomUsageStats.monthlyOccupancy.map((item: { month: string; rate: number }, index: number) => (
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
                    <span className="text-3xl font-bold">
                      {roomUsageStats.activeHomestays}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-sm font-medium">
                        {roomUsageStats.activeHomestays}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${
                            (roomUsageStats.activeHomestays /
                              roomUsageStats.totalHomestays) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Maintenance</span>
                      <span className="text-sm font-medium">
                        {roomUsageStats.maintenanceHomestays}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width: `${
                            (roomUsageStats.maintenanceHomestays /
                              roomUsageStats.totalHomestays) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inactive</span>
                      <span className="text-sm font-medium">
                        {roomUsageStats.inactiveHomestays}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{
                          width: `${
                            (roomUsageStats.inactiveHomestays /
                              roomUsageStats.totalHomestays) *
                            100
                          }%`,
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
              <CardDescription>
                Occupancy rate by season for {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="mb-2 text-lg font-medium">
                    High Season (Jun-Aug)
                  </h3>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: "88%",
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Average Occupancy
                    </span>
                    <span className="font-medium">88%</span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">
                    Shoulder Season (Apr-May, Sep-Oct)
                  </h3>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: "75%",
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Average Occupancy
                    </span>
                    <span className="font-medium">75%</span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">
                    Low Season (Nov-Mar)
                  </h3>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: "65%",
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Average Occupancy
                    </span>
                    <span className="font-medium">65%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
