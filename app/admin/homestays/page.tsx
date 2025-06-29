"use client";

import { useEffect, useState } from "react";
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
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/loading";
import InfiniteScroll from "react-infinite-scroll-component";
import { AdminHomestayRepsonse } from "@/lib/types";

export default function HomestaysPage() {
  const [homestays, setHomestays] = useState<AdminHomestayRepsonse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homestayToDelete, setHomestayToDelete] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // State cho debounce
  const { toast } = useToast();

  // Xử lý debounce cho searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery); // Cập nhật giá trị debounce sau 300ms
    }, 300);

    return () => {
      clearTimeout(handler); // Hủy timeout nếu searchQuery thay đổi trước khi timeout kết thúc
    };
  }, [searchQuery]);

  const fetchHomestays = async (reset = false) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/homestays?search=${searchQuery}&status=${statusFilter}&skip=${
          reset ? 0 : skip
        }&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch homestays");
      }

      const data = await response.json();

      setHomestays((prev) =>
        reset ? data.homestays : [...prev, ...data.homestays]
      );
      setHasMore(data.hasMore);
      setSkip((prev) =>
        reset ? data.homestays.length : prev + data.homestays.length
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load homestays",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomestays(true); // Gọi API khi debouncedSearchQuery hoặc statusFilter thay đổi
  }, [debouncedSearchQuery, statusFilter]);

  const handleDelete = async (homestayId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homestays/${homestayId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete homestay");
      }

      const result = await response.json();

      setHomestays((prev) => prev.filter((h) => h.id !== homestayId));

      toast({
        title: "Success",
        description: result.message,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete homestay",
      });
    } finally {
      setDeleteDialogOpen(false);
      setHomestayToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Homestay</h2>
        <Link href="/admin/homestays/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Homestay
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý Homestay</CardTitle>
          <CardDescription>
            Bạn có tổng cộng {homestays.length} homestay trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm homestay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">HOẠT ĐỘNG</SelectItem>
                  <SelectItem value="INACTIVE">KHÔNG HOẠT ĐỘNG</SelectItem>
                  <SelectItem value="MAINTENANCE">BẢO TRÌ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <InfiniteScroll
              dataLength={homestays.length}
              next={() => fetchHomestays(false)}
              hasMore={hasMore}
              loader={<p className="text-center py-4">Đang tải...</p>}
              endMessage={
                <p className="text-center py-4 text-muted-foreground">
                  Không còn homestay nào để tải.
                </p>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homestays.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Không tìm thấy homestay nào.
                      </TableCell>
                    </TableRow>
                  )}
                  {homestays.map((homestay) => (
                    <TableRow key={homestay.id}>
                      <TableCell className="font-medium">
                        {homestay.name}
                      </TableCell>
                      <TableCell>{homestay.address}</TableCell>
                      <TableCell>{formatCurrency(homestay.price)}</TableCell>
                      <TableCell>{homestay.rating}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            homestay.status
                          )}`}
                        >
                          {homestay.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/homestays/${homestay.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setHomestayToDelete(homestay.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHomestayToDelete(null);
        }}
        onConfirm={() => homestayToDelete && handleDelete(homestayToDelete)}
        itemName="homestay này"
        isDeleting={false}
      />
    </div>
  );
}
