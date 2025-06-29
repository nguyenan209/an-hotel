"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

export default function RevenueReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2023");

  const {
    data: revenueData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["revenue-report", year],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/revenue?year=${year}`
      );
      const data = await res.json();
      return data.revenueData || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">Loading revenue data...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg text-red-500">Failed to load revenue data.</p>
      </div>
    );
  }

  // Calculate total revenue
  const totalRevenue = revenueData.reduce(
    (sum: any, item: any) => sum + item.revenue,
    0
  );

  // Calculate average monthly revenue
  const averageMonthlyRevenue =
    revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  // Find highest revenue month
  const highestRevenueMonth = revenueData.reduce(
    (highest: any, current: any) =>
      current.revenue > highest.revenue ? current : highest,
    revenueData[0] || { revenue: 0, month: "" }
  );

  // Find lowest revenue month
  const lowestRevenueMonth = revenueData.reduce(
    (lowest: any, current: any) =>
      current.revenue < lowest.revenue ? current : lowest,
    revenueData[0] || { revenue: 0, month: "" }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Báo cáo Doanh thu</h2>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chọn năm" />
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
            Xuất
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
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
              Doanh thu trung bình
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
            <CardTitle className="text-sm font-medium">
              Tháng có doanh thu cao nhất
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Tháng có doanh thu thấp nhất
            </CardTitle>
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
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="monthly">Tháng</TabsTrigger>
          <TabsTrigger value="homestays">Theo Homestay</TabsTrigger>
          <TabsTrigger value="customers">Theo Khách hàng</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Doanh thu</CardTitle>
              <CardDescription>
                Doanh thu theo tháng cho năm {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full">
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {revenueData.map((item: any, index: number) => (
                      <div key={index} className="relative flex-1">
                        <div
                          className={`absolute bottom-0 w-full rounded-md ${
                            item.revenue > 0
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          }`}
                          style={{
                            height: `${
                              highestRevenueMonth.revenue > 0
                                ? (item.revenue / highestRevenueMonth.revenue) *
                                  100
                                : 4
                            }%`,
                            minHeight: 4,
                          }}
                        />
                        {item.revenue > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                            {formatCurrency(item.revenue)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {revenueData.map((item: any, index: number) => (
                      <div key={index} className="flex-1 text-center">
                        {item.month}
                      </div>
                    ))}
                  </div>
                  {totalRevenue === 0 && (
                    <div className="text-center text-muted-foreground mt-10 w-full">
                      Không có dữ liệu doanh thu cho năm này.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Doanh thu</CardTitle>
              <CardDescription>
                Doanh thu theo tháng cho năm {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((item: any, index: number) => (
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
                                highestRevenueMonth.revenue > 0
                                  ? (item.revenue /
                                      highestRevenueMonth.revenue) *
                                    100
                                  : 0
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
              <CardTitle>Báo cáo Doanh thu</CardTitle>
              <CardDescription>Doanh thu theo homestay</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Phần này sẽ hiển thị báo cáo doanh thu theo homestay.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Doanh thu</CardTitle>
              <CardDescription>Doanh thu theo khách hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Phần này sẽ hiển thị báo cáo doanh thu theo khách hàng.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
