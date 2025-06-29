"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, Filter, Search, X } from "lucide-react";

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

// Mock data for pending homestay approvals
const mockPendingHomestays = [
  {
    id: "hs1",
    name: "Sunset Beach Villa",
    location: "Đà Nẵng",
    ownerId: "own1",
    ownerName: "Nguyễn Văn A",
    submittedDate: "2023-05-15T10:30:00Z",
    status: "pending",
    rooms: 4,
    images: 8,
  },
  {
    id: "hs2",
    name: "Mountain Retreat Lodge",
    location: "Sapa",
    ownerId: "own2",
    ownerName: "Trần Thị B",
    submittedDate: "2023-05-16T14:20:00Z",
    status: "pending",
    rooms: 6,
    images: 12,
  },
  {
    id: "hs3",
    name: "Riverside Cottage",
    location: "Hội An",
    ownerId: "own3",
    ownerName: "Lê Văn C",
    submittedDate: "2023-05-14T09:15:00Z",
    status: "pending",
    rooms: 3,
    images: 6,
  },
  {
    id: "hs4",
    name: "City Center Apartment",
    location: "Hồ Chí Minh",
    ownerId: "own4",
    ownerName: "Phạm Thị D",
    submittedDate: "2023-05-17T11:45:00Z",
    status: "pending",
    rooms: 2,
    images: 5,
  },
  {
    id: "hs5",
    name: "Lakeside Villa",
    location: "Đà Lạt",
    ownerId: "own5",
    ownerName: "Hoàng Văn E",
    submittedDate: "2023-05-13T16:30:00Z",
    status: "pending",
    rooms: 5,
    images: 10,
  },
];

export default function HomestayApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingHomestays, setPendingHomestays] =
    useState(mockPendingHomestays);

  // Filter homestays based on search query and status filter
  const filteredHomestays = pendingHomestays.filter((homestay) => {
    const matchesSearch =
      homestay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      homestay.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      homestay.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || homestay.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    // In a real app, you would call an API to approve the homestay
    setPendingHomestays(
      pendingHomestays.map((homestay) =>
        homestay.id === id ? { ...homestay, status: "approved" } : homestay
      )
    );
  };

  const handleReject = (id: string) => {
    // In a real app, you would call an API to reject the homestay
    setPendingHomestays(
      pendingHomestays.map((homestay) =>
        homestay.id === id ? { ...homestay, status: "rejected" } : homestay
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Phê duyệt Homestay
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ phê duyệt</SelectItem>
              <SelectItem value="approved">Đã phê duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
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
                placeholder="Tìm kiếm homestay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-normal">
                {filteredHomestays.filter((h) => h.status === "pending").length}{" "}
                Chờ phê duyệt
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 text-sm font-normal"
              >
                {
                  filteredHomestays.filter((h) => h.status === "approved")
                    .length
                }{" "}
                Đã phê duyệt
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 text-sm font-normal"
              >
                {
                  filteredHomestays.filter((h) => h.status === "rejected")
                    .length
                }{" "}
                Từ chối
              </Badge>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Homestay</TableHead>
                  <TableHead>Chủ nhà</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHomestays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Không tìm thấy homestay nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHomestays.map((homestay) => (
                    <TableRow key={homestay.id}>
                      <TableCell className="font-medium">
                        {homestay.name}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/owners/${homestay.ownerId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {homestay.ownerName}
                        </Link>
                      </TableCell>
                      <TableCell>{homestay.location}</TableCell>
                      <TableCell>{homestay.rooms} phòng</TableCell>
                      <TableCell>
                        {formatDate(homestay.submittedDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            homestay.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : homestay.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {homestay.status.charAt(0).toUpperCase() +
                            homestay.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/approvals/${homestay.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Xem</span>
                            </Button>
                          </Link>
                          {homestay.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600"
                                onClick={() => handleApprove(homestay.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Phê duyệt</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => handleReject(homestay.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Từ chối</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
