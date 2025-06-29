"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, Filter, Search, X } from "lucide-react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
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
import { ComplaintPriority, ComplaintStatus } from "@prisma/client";

const PAGE_SIZE = 20;

export default function ComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Infinite query for complaints (OWNER)
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["owner-complaints", searchQuery, statusFilter, priorityFilter],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      params.set("limit", PAGE_SIZE.toString());
      params.set("page", pageParam.toString());
      const res = await fetch(`/api/owner/complaints?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
    getNextPageParam: (
      lastPage: { complaints: any[]; total: number },
      allPages: { complaints: any[]; total: number }[]
    ) => {
      const loaded = allPages.reduce(
        (acc, page) => acc + page.complaints.length,
        0
      );
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
  const openCount = complaints.filter(
    (c: any) => c.status === ComplaintStatus.OPEN
  ).length;
  const resolvedCount = complaints.filter(
    (c: any) => c.status === ComplaintStatus.RESOLVED
  ).length;
  const acknowledgedCount = complaints.filter(
    (c: any) => c.status === ComplaintStatus.ACKNOWLEDGED
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return "bg-red-100 text-red-800";
      case ComplaintStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case ComplaintStatus.ACKNOWLEDGED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case ComplaintPriority.HIGH:
        return "bg-red-100 text-red-800";
      case ComplaintPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case ComplaintPriority.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return "Open";
      case ComplaintStatus.RESOLVED:
        return "Resolved";
      case ComplaintStatus.ACKNOWLEDGED:
        return "Acknowledged";
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/owner/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý khiếu nại</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={ComplaintStatus.OPEN}>Mới</SelectItem>
              <SelectItem value={ComplaintStatus.RESOLVED}>
                Đã giải quyết
              </SelectItem>
              <SelectItem value={ComplaintStatus.ACKNOWLEDGED}>
                Đã xác nhận
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value={ComplaintPriority.HIGH}>Cao</SelectItem>
              <SelectItem value={ComplaintPriority.MEDIUM}>
                Trung bình
              </SelectItem>
              <SelectItem value={ComplaintPriority.LOW}>Thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6 mt-5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khiếu nại..."
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
                {openCount} Mới
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 text-sm font-normal"
              >
                {acknowledgedCount} Đã xác nhận
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 text-sm font-normal"
              >
                {resolvedCount} Đã giải quyết
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Đang tải khiếu nại...</div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Lỗi tải khiếu nại.
            </div>
          ) : (
            <InfiniteScroll
              dataLength={complaints.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={<div className="text-center py-4">Đang tải thêm...</div>}
              endMessage={
                <div className="text-center py-4 text-muted-foreground">
                  {complaints.length === 0
                    ? "Không tìm thấy khiếu nại"
                    : `Tất cả khiếu nại đã tải (${complaints.length}/${total})`}
                </div>
              }
              scrollableTarget={null}
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chủ đề</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Mức độ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
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
                            href={`/owner/customers/${complaint.customerId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {complaint.customer?.user?.name || "-"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPriorityColor(complaint.priority)}
                          >
                            {complaint.priority.charAt(0) +
                              complaint.priority.slice(1).toLowerCase()}
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
                            <Link href={`/owner/complaints/${complaint.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Xem</span>
                              </Button>
                            </Link>
                            {complaint.status !==
                              ComplaintStatus.ACKNOWLEDGED && (
                              <>
                                {complaint.status !==
                                  ComplaintStatus.RESOLVED && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    title="Đánh dấu là đã giải quyết"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: complaint.id,
                                        status: ComplaintStatus.RESOLVED,
                                      })
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">
                                      Đánh dấu là đã giải quyết
                                    </span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-yellow-600"
                                  title="Đóng khiếu nại"
                                  disabled={updateStatusMutation.isPending}
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: complaint.id,
                                      status: ComplaintStatus.ACKNOWLEDGED,
                                    })
                                  }
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Từ chối</span>
                                </Button>
                              </>
                            )}
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
