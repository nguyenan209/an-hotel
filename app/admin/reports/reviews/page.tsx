"use client"

import { useState } from "react"
import { Download, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockReviewStats, mockReviews } from "@/lib/mock-data/admin"
import { formatDate, getStatusColor } from "@/lib/utils"

export default function ReviewReportPage() {
  const [timeRange, setTimeRange] = useState("year")
  const [year, setYear] = useState("2023")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter reviews based on status filter
  const filteredReviews = mockReviews.filter((review) => {
    return statusFilter === "all" || review.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Review Reports</h2>
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
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReviewStats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">For all homestays</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReviewStats.averageRating}/5</div>
            <div className="mt-1 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(mockReviewStats.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReviewStats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockReviewStats.ratingDistribution.find((r) => r.rating === 5)?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                ((mockReviewStats.ratingDistribution.find((r) => r.rating === 5)?.count || 0) /
                  mockReviewStats.totalReviews) *
                  100,
              )}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Rating Distribution</TabsTrigger>
          <TabsTrigger value="recent">Recent Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Overview</CardTitle>
              <CardDescription>Summary of customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Rating Distribution</h3>
                  <div className="space-y-2">
                    {mockReviewStats.ratingDistribution.map((item) => (
                      <div key={item.rating} className="flex items-center gap-2">
                        <div className="flex w-12 items-center">
                          <span className="font-medium">{item.rating}</span>
                          <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${(item.count / mockReviewStats.totalReviews) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-right text-sm text-muted-foreground">
                          {Math.round((item.count / mockReviewStats.totalReviews) * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Review Status</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{mockReviewStats.approvedReviews}</div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{mockReviewStats.pendingReviews}</div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{mockReviewStats.rejectedReviews}</div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Detailed breakdown of ratings by homestay</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This section would show rating distribution by homestay.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer reviews and feedback</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{review.customerName}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            review.status,
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">{review.comment}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Homestay: {review.homestayName}</div>
                    {review.status === "pending" && (
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
