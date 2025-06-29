"use client";

import { HomestayCombobox } from "@/components/homestay/homestay-compobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [homestayFilter, setHomestayFilter] = useState("all");
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch rooms with react-query infinite
  const fetchRooms = async ({ pageParam = 0 }) => {
    const params = new URLSearchParams({
      search: searchQuery,
      status: statusFilter,
      skip: pageParam.toString(),
      limit: "10",
    });
    if (homestayFilter !== "all") {
      params.set("homestayId", homestayFilter);
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/owner/rooms?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to load rooms");
    }
    return response.json();
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["owner-rooms", searchQuery, statusFilter, homestayFilter],
    queryFn: fetchRooms,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, page) => acc + page.rooms.length, 0);
      return lastPage.hasMore ? loaded : undefined;
    },
    refetchOnWindowFocus: false,
  });

  // Flatten rooms
  const rooms = data?.pages?.flatMap((page) => page.rooms) || [];

  // Handle delete
  const handleDelete = async (roomId: string | null) => {
    if (!roomId) return;
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete room");
      }
      toast.success("Room deleted");
      // Refetch rooms
      refetch();
    } catch (error) {
      toast.error("Failed to delete the room. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Phòng</h2>
        <Link href="/owner/rooms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm phòng
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6 mt-5">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <HomestayCombobox
                value={homestayFilter}
                onValueChange={setHomestayFilter}
                placeholder="Lọc theo homestay"
                allOptionLabel="Tất cả homestays"
                showAllOption={true}
                className="w-[200px]"
                triggerClassName="w-[200px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="AVAILABLE">Có sẵn</SelectItem>
                  <SelectItem value="BOOKED">Đã đặt</SelectItem>
                  <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <InfiniteScroll
              dataLength={rooms.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={<p className="text-center py-4">Đang tải...</p>}
              endMessage={
                <p className="text-center py-4 text-muted-foreground">
                  Không còn phòng để tải.
                </p>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Số khách</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Không tìm thấy phòng
                      </TableCell>
                    </TableRow>
                  ) : (
                    rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">
                          {room.name}
                        </TableCell>
                        <TableCell>{room?.homestay?.name}</TableCell>
                        <TableCell>{room.capacity} khách</TableCell>
                        <TableCell>{formatCurrency(room.price)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              room.status
                            )}`}
                          >
                            {room.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/owner/rooms/${room.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Sửa</span>
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRoomToDelete(room.id)}
                              disabled={isDeleting}
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
            </InfiniteScroll>
          </div>
        </CardContent>
      </Card>
      {/* Confirmation Dialog */}
      <AlertDialog
        open={roomToDelete !== null}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Phòng này sẽ bị xóa vĩnh viễn
              khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete(roomToDelete);
                setRoomToDelete(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
