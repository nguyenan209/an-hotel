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
import { formatCurrency } from "@/lib/utils";
import { mockRevenueData } from "@/lib/mock-data/admin";

export default function RevenueReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2023");

  // Calculate total revenue
  const totalRevenue = mockRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  // Calculate average monthly revenue
  const averageMonthlyRevenue = totalRevenue / mockRevenueData.length;

  // Find highest revenue month
  const highestRevenueMonth = mockRevenueData.reduce(
    (highest, current) =>
      current.revenue > highest.revenue ? current : highest,
    mockRevenueData[0]
  );

  // Find lowest revenue month
  const lowestRevenueMonth = mockRevenueData.reduce(
    (lowest, current) => (current.revenue < lowest.revenue ? current : lowest),
    mockRevenueData[0]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Reports</h2>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">For the year {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageMonthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Per month in {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(highestRevenueMonth.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {highestRevenueMonth.month} {year}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lowestRevenueMonth.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {lowestRevenueMonth.month} {year}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="homestays">By Homestay</TabsTrigger>
          <TabsTrigger value="customers">By Customer</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue for the year {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full">
                {/* This would be a chart in a real implementation */}
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {mockRevenueData.map((item, index) => (
                      <div key={index} className="relative flex-1">
                        <div
                          className="absolute bottom-0 w-full rounded-md bg-primary"
                          style={{
                            height: `${
                              (item.revenue / highestRevenueMonth.revenue) * 100
                            }%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {mockRevenueData.map((item, index) => (
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
                Detailed monthly revenue analysis for {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRevenueData.map((item, index) => (
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
                                (item.revenue / highestRevenueMonth.revenue) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="homestays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Homestay</CardTitle>
              <CardDescription>
                Top performing homestays by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section would show revenue breakdown by homestay.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Customer</CardTitle>
              <CardDescription>Top customers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section would show revenue breakdown by customer.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
