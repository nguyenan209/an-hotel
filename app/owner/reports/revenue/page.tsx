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
import Loading from "@/components/loading";

export default function RevenueReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2025");

  const MAX_BAR_HEIGHT = 100; // phần trăm chiều cao tối đa cột cao nhất

  const {
    data: revenueData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["revenue-report", year],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/reports/revenue?year=${year}`
      );
      const data = await res.json();
      return data.revenueData || [];
    },
  });

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg text-red-500">
          Không load được dữ liệu doanh thu
        </p>
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
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Trong năm {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trung bình tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageMonthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trên tháng trong năm {year}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tháng cao nhất
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
              Tháng thấp nhất
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
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan doanh thu</CardTitle>
              <CardDescription>
                Doanh thu theo tháng trong năm {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full flex flex-col justify-end">
                <div className="flex items-end gap-2 h-full min-h-[300px]">
                  {revenueData.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex-1 relative h-full flex items-end"
                    >
                      {/* Bar */}
                      <div
                        className={`${
                          item.revenue > 0
                            ? "bg-primary"
                            : "bg-muted-foreground/20"
                        } absolute bottom-0 w-full rounded-md`}
                        style={{
                          height:
                            highestRevenueMonth.revenue > 0
                              ? `${
                                  (item.revenue / highestRevenueMonth.revenue) *
                                  MAX_BAR_HEIGHT
                                }%`
                              : "0%",
                          transition: "height 0.3s",
                        }}
                      >
                        {/* Label doanh thu trên đỉnh bar */}
                        {item.revenue > 0 && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs font-medium"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {formatCurrency(item.revenue)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {revenueData.map((item: any, index: number) => (
                    <div key={index} className="flex-1 text-center">
                      {item.month}
                    </div>
                  ))}
                </div>
                {totalRevenue === 0 && (
                  <div className="text-center text-muted-foreground mt-10 w-full">
                    Không có dữ liệu doanh thu.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
