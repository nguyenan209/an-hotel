"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Plus, Trash } from "lucide-react";

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
import { InfiniteScroll } from "@/components/infinite-scroll";
import { formatDate, getStatusColor } from "@/lib/utils";
import Loading from "@/components/loading";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<
    {
      id: string;
      user: { name: string; email: string; phone: string; status: string };
      totalBookings: number;
      createdAt: string;
    }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCustomers = async (reset = false) => {
    if (isLoading || isLoadingMore) return;

    if (reset) {
      setPage(1);
      setHasMore(true);
    }

    const currentPage = reset ? 1 : page;

    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/customers?search=${searchQuery}&status=${statusFilter}&page=${currentPage}&limit=10`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();

      setCustomers((prev) =>
        reset ? data.customers : [...prev, ...data.customers]
      );
      setHasMore(data.customers.length > 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      if (reset) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchCustomers(true); // Reset data khi searchQuery hoặc statusFilter thay đổi
  }, [searchQuery, statusFilter]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      fetchCustomers();
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng</h2>
        <Link href="/admin/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách hàng mới
          </Button>
        </Link>
      </div>

      <Card>
          <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6 mt-5">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">HOẠT ĐỘNG</SelectItem>
                  <SelectItem value="INACTIVE">KHÔNG HOẠT ĐỘNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Tổng đặt phòng</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.user.name}
                      </TableCell>
                      <TableCell>{customer.user.email}</TableCell>
                      <TableCell>{customer.user.phone}</TableCell>
                      <TableCell>{customer.totalBookings}</TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            customer.user.status
                          )}`}
                        >
                          {customer.user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
          />
        </CardContent>
      </Card>
    </div>
  );
}
