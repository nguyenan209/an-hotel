"use client";

import { Edit, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { HomestayCombobox } from "@/components/homestay/homestay-compobox";
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
import { useToast } from "@/hooks/use-toast";
import { getHomestays, getRooms } from "@/lib/data";
import { formatCurrency, getStatusColor } from "@/lib/utils";
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
import Loading from "@/components/loading";

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [homestayFilter, setHomestayFilter] = useState("all");
  const [rooms, setRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRooms = async (skip = 0, append = false) => {
    setIsLoading(true);
    try {
      const data = await getRooms({
        search: searchQuery,
        status: statusFilter,
        skip,
        limit: 10,
      });

      setRooms((prev) => {
        if (!append) {
          // Khi append = false, thay thế toàn bộ danh sách rooms
          return data.rooms;
        }

        // Khi append = true, thêm các bản ghi mới vào danh sách hiện tại
        const roomIds = new Set(prev.map((room) => room.id));
        const uniqueRooms = data.rooms.filter((room) => !roomIds.has(room.id));

        return [...prev, ...uniqueRooms];
      });

      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      setError("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRooms = async () => {
    if (!hasMore || isLoading) return;

    const nextSkip = rooms.length;
    await fetchRooms(nextSkip, true); // Gọi API với skip = rooms.length và append = true
  };

  useEffect(() => {
    fetchRooms(0, false); // Gọi API lần đầu tiên
  }, [searchQuery, statusFilter]);

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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      // Xóa phòng khỏi danh sách hiện tại
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
      useToast().toast({
        title: "Room deleted",
        description: "The room has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      useToast().toast({
        title: "Error",
        description: "Failed to delete the room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Phòng</h2>
        <Link href="/admin/rooms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Phòng
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
                allOptionLabel="Tất cả homestay"
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
              dataLength={rooms.length} // Số lượng bản ghi hiện tại
              next={loadMoreRooms} // Hàm tải thêm dữ liệu
              hasMore={hasMore} // Xác định có còn dữ liệu để tải không
              loader={<p className="text-center py-4">Loading...</p>} // Hiển thị khi đang tải
              endMessage={
                <p className="text-center py-4 text-muted-foreground">
                  Không còn phòng để tải thêm.
                </p>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Số lượng khách</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Không tìm thấy phòng nào
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
                            <Link href={`/admin/rooms/${room.id}`}>
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
