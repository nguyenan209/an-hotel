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
import { formatCurrency } from "@/lib/utils";

export default function RevenueReportPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2023");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/revenue?year=${year}`);
        const data = await res.json();
        setRevenueData(data.revenueData || []);
      } catch (e) {
        setRevenueData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenue();
  }, [year]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">Loading revenue data...</p>
      </div>
    );
  }

  // Calculate total revenue
  const totalRevenue = revenueData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  // Calculate average monthly revenue
  const averageMonthlyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  // Find highest revenue month
  const highestRevenueMonth = revenueData.reduce(
    (highest, current) =>
      current.revenue > highest.revenue ? current : highest,
    revenueData[0] || { revenue: 0, month: "" }
  );

  // Find lowest revenue month
  const lowestRevenueMonth = revenueData.reduce(
    (lowest, current) => (current.revenue < lowest.revenue ? current : lowest),
    revenueData[0] || { revenue: 0, month: "" }
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
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex items-end gap-2 h-full">
                    {revenueData.map((item, index) => (
                      <div key={index} className="relative flex-1">
                        <div
                          className={`absolute bottom-0 w-full rounded-md ${item.revenue > 0 ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                          style={{
                            height: `${
                              highestRevenueMonth.revenue > 0 ? (item.revenue / highestRevenueMonth.revenue) * 100 : 4
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
                    {revenueData.map((item, index) => (
                      <div key={index} className="flex-1 text-center">
                        {item.month}
                      </div>
                    ))}
                  </div>
                  {totalRevenue === 0 && (
                    <div className="text-center text-muted-foreground mt-10 w-full">No revenue data for this year.</div>
                  )}
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
                {revenueData.map((item, index) => (
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
                                highestRevenueMonth.revenue > 0 ? (item.revenue / highestRevenueMonth.revenue) * 100 : 0
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
