"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Eye, Trash } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

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
import {
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";

type Customer = {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  totalBookings: number;
  createdAt: string;
};

type CustomersResponse = {
  customers: Customer[];
  hasMore: boolean;
};

async function fetchCustomers({
  search,
  status,
  skip,
  limit,
}: {
  search: string;
  status: string;
  skip: number;
  limit: number;
}): Promise<CustomersResponse> {
  const params = new URLSearchParams({
    search: search || "",
    status: status || "all",
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/owner/customers?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }
  return response.json();
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  const limit = 10;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<CustomersResponse>({
    queryKey: ["customers", searchQuery, statusFilter],
    queryFn: ({ pageParam = 0 }) =>
      fetchCustomers({
        search: searchQuery,
        status: statusFilter,
        skip: (pageParam as number) * limit,
        limit,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.customers.length / limit;
    },
  });

  const customers = data?.pages.flatMap((page) => page.customers) || [];

  const loadMoreCustomers = async () => {
    if (isFetchingNextPage || !hasNextPage) return;
    await fetchNextPage();
  };

  const queryClient = useQueryClient();

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/customers/${customerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete customer");

      // Refetch customers after deletion
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div>{(error as Error).message || "Failed to load customers"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Khách hàng</h2>
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
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
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
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Không tìm thấy khách hàng
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
                          <Link href={`/owner/customers/${customer.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
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
            onLoadMore={loadMoreCustomers}
            hasMore={hasNextPage || false}
            isLoading={isFetchingNextPage}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng này? Thao tác này không thể
              được hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteCustomer(selectedCustomerId!)}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
