"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, PieChart, DonutChart } from "@/components/ui/chart";
import {
  Download,
  Filter,
  Users,
  MapPin,
  Globe,
  UserCircle2,
  Home,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for demographics reports
const ageDistributionData = [
  { name: "18-24", value: 15 },
  { name: "25-34", value: 32 },
  { name: "35-44", value: 27 },
  { name: "45-54", value: 18 },
  { name: "55-64", value: 6 },
  { name: "65+", value: 2 },
];

const genderDistributionData = [
  { name: "Male", value: 48, fill: "#4f46e5" },
  { name: "Female", value: 46, fill: "#ec4899" },
  { name: "Non-binary", value: 4, fill: "#8b5cf6" },
  { name: "Prefer not to say", value: 2, fill: "#94a3b8" },
];

const travelTypeData = [
  { name: "Families", value: 35, fill: "#3b82f6" },
  { name: "Couples", value: 28, fill: "#ec4899" },
  { name: "Solo Travelers", value: 18, fill: "#10b981" },
  { name: "Business", value: 12, fill: "#f59e0b" },
  { name: "Groups", value: 7, fill: "#8b5cf6" },
];

const topCountriesData = [
  { name: "Vietnam", value: 42 },
  { name: "Japan", value: 18 },
  { name: "South Korea", value: 12 },
  { name: "China", value: 10 },
  { name: "United States", value: 8 },
  { name: "Australia", value: 5 },
  { name: "Other", value: 5 },
];

const bookingPreferencesByAge = [
  { age: "18-24", luxury: 10, standard: 25, budget: 65 },
  { age: "25-34", luxury: 22, standard: 48, budget: 30 },
  { age: "35-44", luxury: 35, standard: 45, budget: 20 },
  { age: "45-54", luxury: 42, standard: 38, budget: 20 },
  { age: "55-64", luxury: 48, standard: 40, budget: 12 },
  { age: "65+", luxury: 55, standard: 35, budget: 10 },
];

const customerGrowthData = [
  { month: "Jan", new: 120, returning: 80 },
  { month: "Feb", new: 132, returning: 85 },
  { month: "Mar", new: 141, returning: 94 },
  { month: "Apr", new: 158, returning: 98 },
  { month: "May", new: 165, returning: 102 },
  { month: "Jun", new: 180, returning: 110 },
  { month: "Jul", new: 190, returning: 115 },
  { month: "Aug", new: 205, returning: 125 },
  { month: "Sep", new: 190, returning: 130 },
  { month: "Oct", new: 180, returning: 135 },
  { month: "Nov", new: 175, returning: 140 },
  { month: "Dec", new: 210, returning: 150 },
];

const topCitiesData = [
  { name: "Ho Chi Minh City", value: 28 },
  { name: "Hanoi", value: 22 },
  { name: "Da Nang", value: 15 },
  { name: "Nha Trang", value: 12 },
  { name: "Hoi An", value: 8 },
  { name: "Other", value: 15 },
];

const demographicInsights = [
  {
    title: "Young Professionals",
    description: "25-34 age group shows highest growth rate at 18% YoY",
    trend: "up",
    category: "age",
  },
  {
    title: "Family Bookings",
    description: "Families spend 35% more on average per booking",
    trend: "up",
    category: "type",
  },
  {
    title: "International Guests",
    description: "Japanese tourists increased by 22% in the last quarter",
    trend: "up",
    category: "location",
  },
  {
    title: "Senior Travelers",
    description: "65+ demographic shows 5% decline in bookings",
    trend: "down",
    category: "age",
  },
];

export default function DemographicsReportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo Demographics
          </h1>
          <p className="text-muted-foreground">
            Phân tích đặc điểm khách hàng và mẫu đặt phòng
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">7 ngày qua</SelectItem>
              <SelectItem value="last30days">30 ngày qua</SelectItem>
              <SelectItem value="last90days">90 ngày qua</SelectItem>
              <SelectItem value="lastyear">Năm qua</SelectItem>
              <SelectItem value="alltime">Tất cả thời gian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số khách hàng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,685</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tuổi trung bình
            </CardTitle>
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36.4</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+1.2</span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quốc gia</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Vietnam</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>42% của tất cả đặt phòng</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loại khách</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Families</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>35% của tất cả đặt phòng</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different demographic views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="age">Phân phối tuổi</TabsTrigger>
          <TabsTrigger value="location">Địa lý</TabsTrigger>
          <TabsTrigger value="preferences">Sở thích</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Gender Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Phân phối giới tính</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo giới tính
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <PieChart
                    data={genderDistributionData}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}%`}
                    colors={["#4f46e5", "#ec4899", "#8b5cf6", "#94a3b8"]}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Phân phối tuổi</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo nhóm tuổi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart
                    data={ageDistributionData}
                    index="name"
                    categories={["value"]}
                    colors={["#3b82f6"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Traveler Types */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Loại khách</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo loại khách
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <DonutChart
                    data={travelTypeData}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}%`}
                    colors={[
                      "#3b82f6",
                      "#ec4899",
                      "#10b981",
                      "#f59e0b",
                      "#8b5cf6",
                    ]}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quốc gia</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo quốc gia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart
                    data={topCountriesData}
                    index="name"
                    categories={["value"]}
                    colors={["#8b5cf6"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demographic Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Những điểm quan trọng trong phân tích đặc điểm khách hàng
              </CardTitle>
              <CardDescription>
                Những điểm quan trọng trong phân tích đặc điểm khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {demographicInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 border rounded-lg p-3"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        insight.category === "age"
                          ? "bg-blue-100 text-blue-600"
                          : insight.category === "type"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {insight.category === "age" ? (
                        <UserCircle2 className="h-5 w-5" />
                      ) : insight.category === "type" ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge
                          variant={
                            insight.trend === "up" ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {insight.trend === "up" ? "Tăng" : "Giảm"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Age Distribution Tab */}
        <TabsContent value="age" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Phân phối tuổi</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo nhóm tuổi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <BarChart
                    data={ageDistributionData}
                    index="name"
                    categories={["value"]}
                    colors={["#3b82f6"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[400px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Sở thích đặt phòng theo tuổi</CardTitle>
                <CardDescription>
                  Sở thích đặt phòng theo nhóm tuổi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <BarChart
                    data={bookingPreferencesByAge}
                    index="age"
                    categories={["luxury", "standard", "budget"]}
                    colors={["#8b5cf6", "#3b82f6", "#10b981"]}
                    valueFormatter={(value) => `${value}%`}
                    stack
                    className="h-[400px]"
                  />
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></div>
                    <span className="text-sm">Luxury</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                    <span className="text-sm">Standard</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                    <span className="text-sm">Budget</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="location" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quốc gia</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo quốc gia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <BarChart
                    data={topCountriesData}
                    index="name"
                    categories={["value"]}
                    colors={["#8b5cf6"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[400px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thành phố</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo thành phố
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <PieChart
                    data={topCitiesData}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}%`}
                    colors={[
                      "#3b82f6",
                      "#8b5cf6",
                      "#10b981",
                      "#f59e0b",
                      "#ec4899",
                      "#94a3b8",
                    ]}
                    className="h-[400px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loại khách</CardTitle>
                <CardDescription>
                  Phân phối khách hàng theo loại khách
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <DonutChart
                    data={travelTypeData}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}%`}
                    colors={[
                      "#3b82f6",
                      "#ec4899",
                      "#10b981",
                      "#f59e0b",
                      "#8b5cf6",
                    ]}
                    className="h-[400px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sở thích đặt phòng theo tuổi</CardTitle>
                <CardDescription>
                  Sở thích đặt phòng theo nhóm tuổi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <BarChart
                    data={bookingPreferencesByAge}
                    index="age"
                    categories={["luxury", "standard", "budget"]}
                    colors={["#8b5cf6", "#3b82f6", "#10b981"]}
                    valueFormatter={(value) => `${value}%`}
                    stack
                    className="h-[400px]"
                  />
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></div>
                    <span className="text-sm">Luxury</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                    <span className="text-sm">Standard</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                    <span className="text-sm">Budget</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng khách hàng</CardTitle>
              <CardDescription>
                Khách hàng mới so với khách hàng cũ theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <BarChart
                  data={customerGrowthData}
                  index="month"
                  categories={["new", "returning"]}
                  colors={["#3b82f6", "#8b5cf6"]}
                  valueFormatter={(value) => `${value}`}
                  stack
                  className="h-[400px]"
                />
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                  <span className="text-sm">Khách hàng mới</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></div>
                  <span className="text-sm">Khách hàng cũ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
