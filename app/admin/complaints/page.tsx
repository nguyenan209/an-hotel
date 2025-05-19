"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, Filter, Search } from "lucide-react";

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

// Mock data for complaints
const mockComplaints = [
  {
    id: "comp1",
    subject: "Phòng không sạch sẽ",
    customerId: "cust1",
    customerName: "Lê Minh",
    homestayId: "hs1",
    homestayName: "Sunset Beach Villa",
    bookingId: "book123",
    priority: "high",
    status: "open",
    createdAt: "2023-06-15T10:30:00Z",
    lastUpdated: "2023-06-15T14:45:00Z",
  },
  {
    id: "comp2",
    subject: "Thiếu tiện nghi như đã quảng cáo",
    customerId: "cust2",
    customerName: "Trần Hoa",
    homestayId: "hs2",
    homestayName: "Mountain Retreat Lodge",
    bookingId: "book234",
    priority: "medium",
    status: "in_progress",
    createdAt: "2023-06-16T09:20:00Z",
    lastUpdated: "2023-06-17T11:30:00Z",
  },
  {
    id: "comp3",
    subject: "Chủ nhà không thân thiện",
    customerId: "cust3",
    customerName: "Nguyễn Thành",
    homestayId: "hs3",
    homestayName: "Riverside Cottage",
    bookingId: "book345",
    priority: "low",
    status: "resolved",
    createdAt: "2023-06-14T15:10:00Z",
    lastUpdated: "2023-06-18T09:15:00Z",
  },
  {
    id: "comp4",
    subject: "Vấn đề về thanh toán",
    customerId: "cust4",
    customerName: "Phạm Linh",
    homestayId: "hs4",
    homestayName: "City Center Apartment",
    bookingId: "book456",
    priority: "high",
    status: "open",
    createdAt: "2023-06-17T08:45:00Z",
    lastUpdated: "2023-06-17T08:45:00Z",
  },
  {
    id: "comp5",
    subject: "Hủy đặt phòng không hoàn tiền",
    customerId: "cust5",
    customerName: "Hoàng Nam",
    homestayId: "hs5",
    homestayName: "Lakeside Villa",
    bookingId: "book567",
    priority: "medium",
    status: "closed",
    createdAt: "2023-06-13T11:30:00Z",
    lastUpdated: "2023-06-19T14:20:00Z",
  },
];

export default function ComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [complaints, setComplaints] = useState(mockComplaints);

  // Filter complaints based on search query, status filter, and priority filter
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.customerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      complaint.homestayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || complaint.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Complaint Management
        </h2>
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
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
                {filteredComplaints.filter((c) => c.status === "open").length}{" "}
                Open
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 text-sm font-normal"
              >
                {
                  filteredComplaints.filter((c) => c.status === "in_progress")
                    .length
                }{" "}
                In Progress
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 text-sm font-normal"
              >
                {
                  filteredComplaints.filter((c) => c.status === "resolved")
                    .length
                }{" "}
                Resolved
              </Badge>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Homestay</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No complaints found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">
                        {complaint.subject}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/customers/${complaint.customerId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {complaint.customerName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/homestays/${complaint.homestayId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {complaint.homestayName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority.charAt(0).toUpperCase() +
                            complaint.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status)}>
                          {formatStatus(complaint.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                      <TableCell>{formatDate(complaint.lastUpdated)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/complaints/${complaint.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </Link>
                          {complaint.status === "open" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600"
                              onClick={() => {
                                // In a real app, you would call an API to update the complaint status
                                setComplaints(
                                  complaints.map((c) =>
                                    c.id === complaint.id
                                      ? {
                                          ...c,
                                          status: "in_progress",
                                          lastUpdated: new Date().toISOString(),
                                        }
                                      : c
                                  )
                                );
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                <path d="m7 12 3 3 7-7" />
                              </svg>
                              <span className="sr-only">Take Action</span>
                            </Button>
                          )}
                          {complaint.status === "in_progress" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => {
                                // In a real app, you would call an API to update the complaint status
                                setComplaints(
                                  complaints.map((c) =>
                                    c.id === complaint.id
                                      ? {
                                          ...c,
                                          status: "resolved",
                                          lastUpdated: new Date().toISOString(),
                                        }
                                      : c
                                  )
                                );
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Resolve</span>
                            </Button>
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
