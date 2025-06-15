"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, Filter, Search } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function ComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Infinite query for complaints
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["admin-complaints", searchQuery, statusFilter, priorityFilter],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      params.set("limit", PAGE_SIZE.toString());
      params.set("page", pageParam.toString());
      const res = await fetch(`/api/admin/complaints?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
    getNextPageParam: (lastPage: { complaints: any[]; total: number }, allPages: { complaints: any[]; total: number }[]) => {
      const loaded = allPages.reduce((acc, page) => acc + page.complaints.length, 0);
      if (loaded < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const complaints = data?.pages.flatMap((page) => page.complaints) || [];
  const total = data?.pages[0]?.total || 0;

  // Filtered counts for badges (tính trên toàn bộ complaints đã load)
  const openCount = complaints.filter((c: any) => c.status === "OPEN").length;
  const inProgressCount = complaints.filter((c: any) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c: any) => c.status === "RESOLVED").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "In Progress";
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Complaint Management
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Complaints</CardTitle>
          <CardDescription>
            Manage and resolve customer complaints and issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 text-sm font-normal"
              >
                {openCount} Open
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 text-sm font-normal"
              >
                {inProgressCount} In Progress
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 text-sm font-normal"
              >
                {resolvedCount} Resolved
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading complaints...</div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">Failed to load complaints.</div>
          ) : (
            <InfiniteScroll
              dataLength={complaints.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={<div className="text-center py-4">Loading more...</div>}
              endMessage={
                <div className="text-center py-4 text-muted-foreground">
                  {complaints.length === 0
                    ? "No complaints found"
                    : `All complaints loaded (${complaints.length}/${total})`}
                </div>
              }
              scrollableTarget={null}
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint: any) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">
                          {complaint.subject}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/customers/${complaint.customerId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {complaint.customer?.user?.name || "-"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority.charAt(0) + complaint.priority.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(complaint.status)}>
                            {formatStatus(complaint.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/complaints/${complaint.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
