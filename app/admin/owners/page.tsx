"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Filter, Plus, Search, UserCog } from "lucide-react";

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

// Mock data for homestay owners
const mockOwners = [
  {
    id: "own1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    totalHomestays: 3,
    joinDate: "2023-01-15T10:30:00Z",
    status: "active",
  },
  {
    id: "own2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0912345678",
    totalHomestays: 2,
    joinDate: "2023-02-20T14:45:00Z",
    status: "active",
  },
  {
    id: "own3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone: "0923456789",
    totalHomestays: 1,
    joinDate: "2023-03-10T09:15:00Z",
    status: "suspended",
  },
  {
    id: "own4",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "0934567890",
    totalHomestays: 4,
    joinDate: "2023-01-05T11:30:00Z",
    status: "active",
  },
  {
    id: "own5",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "0945678901",
    totalHomestays: 2,
    joinDate: "2023-04-12T16:20:00Z",
    status: "terminated",
  },
];

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter owners based on search query and status filter
  const filteredOwners = mockOwners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || owner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Homestay Owners</h2>
        <Link href="/admin/owners/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Owner
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Homestay Owners</CardTitle>
          <CardDescription>
            View and manage all homestay owners registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Homestays</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No owners found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOwners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">
                        {owner.name}
                      </TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>{owner.phone}</TableCell>
                      <TableCell>{owner.totalHomestays}</TableCell>
                      <TableCell>{formatDate(owner.joinDate)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            owner.status === "active"
                              ? "bg-green-100 text-green-800"
                              : owner.status === "suspended"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {owner.status.charAt(0).toUpperCase() +
                            owner.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/owners/${owner.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Link href={`/admin/owners/${owner.id}/homestays`}>
                            <Button variant="ghost" size="icon">
                              <UserCog className="h-4 w-4" />
                              <span className="sr-only">Manage Homestays</span>
                            </Button>
                          </Link>
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
