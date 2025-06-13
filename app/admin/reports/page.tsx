"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Home,
  DollarSign,
  Calendar,
  Star,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/overview`);
        const data = await res.json();
        setOverview(data);
      } catch (e) {
        setOverview(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (isLoading || !overview) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">Loading reports overview...</p>
      </div>
    );
  }

  const { reportMetrics, reportCategories, recentActivity } = overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your homestay business performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportMetrics.totalRevenue.value}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportMetrics.totalRevenue.trend === "up" ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  reportMetrics.totalRevenue.trend === "up"
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {reportMetrics.totalRevenue.change}
              </span>
              <span className="ml-1">{reportMetrics.totalRevenue.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportMetrics.totalBookings.value}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">
                {reportMetrics.totalBookings.change}
              </span>
              <span className="ml-1">{reportMetrics.totalBookings.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Homestays
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportMetrics.activeHomestays.value}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">
                {reportMetrics.activeHomestays.change}
              </span>
              <span className="ml-1">
                {reportMetrics.activeHomestays.period}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportMetrics.averageRating.value}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">
                {reportMetrics.averageRating.change}
              </span>
              <span className="ml-1">{reportMetrics.averageRating.period}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportCategories.map((category: any) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={category.href}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`${category.color} p-2 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {category.stats}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={category.href}>
                      View Report
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and alerts from your reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                        ? "bg-yellow-500"
                        : activity.status === "info"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "success"
                        ? "default"
                        : activity.status === "warning"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common reporting tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance Summary
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Customer Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Custom Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Revenue trend for the last 7d</CardDescription>
        </CardHeader>
        <CardContent>
          {(!overview.revenueTrend || overview.revenueTrend.length === 0 || overview.revenueTrend.every((d: any) => d.value === 0)) ? (
            <div className="text-center text-muted-foreground mt-10">No revenue data for this period.</div>
          ) : (
            <div id="dashboard-revenue-chart" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
