"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MessageSquare, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface ComplaintDetailPageProps {
  params: {
    id: string;
  };
}

export default function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  // Mock data for the complaint
  const complaint = {
    id: params.id,
    subject: "Phòng không sạch sẽ",
    description:
      "Khi chúng tôi đến nơi, phòng không được dọn dẹp sạch sẽ. Có rác từ khách trước và phòng tắm không được vệ sinh. Chúng tôi đã liên hệ với chủ nhà nhưng không nhận được phản hồi kịp thời.",
    customerId: "cust1",
    customerName: "Lê Minh",
    customerEmail: "leminh@example.com",
    customerPhone: "0901234567",
    homestayId: "hs1",
    homestayName: "Sunset Beach Villa",
    bookingId: "book123",
    checkIn: "2023-06-01",
    checkOut: "2023-06-05",
    priority: "high",
    status: "in_progress",
    createdAt: "2023-06-15T10:30:00Z",
    lastUpdated: "2023-06-17T11:30:00Z",
    assignedTo: "admin2",
    assignedToName: "Trần Quản Lý",
    messages: [
      {
        id: "msg1",
        senderId: "cust1",
        senderName: "Lê Minh",
        senderType: "customer",
        message:
          "Tôi rất thất vọng về tình trạng phòng khi chúng tôi đến. Mong được giải quyết sớm.",
        createdAt: "2023-06-15T10:30:00Z",
      },
      {
        id: "msg2",
        senderId: "admin1",
        senderName: "Nguyễn Admin",
        senderType: "admin",
        message:
          "Xin lỗi về trải nghiệm không tốt của bạn. Chúng tôi đang liên hệ với chủ nhà để giải quyết vấn đề này.",
        createdAt: "2023-06-15T14:45:00Z",
      },
      {
        id: "msg3",
        senderId: "own1",
        senderName: "Chủ nhà",
        senderType: "owner",
        message:
          "Tôi xin lỗi về sự cố này. Đã có sự nhầm lẫn trong lịch dọn dẹp. Chúng tôi sẽ cử người đến dọn dẹp ngay lập tức và sẽ giảm giá 20% cho đêm đầu tiên.",
        createdAt: "2023-06-16T09:15:00Z",
      },
      {
        id: "msg4",
        senderId: "admin2",
        senderName: "Trần Quản Lý",
        senderType: "admin",
        message:
          "Chúng tôi đã xác nhận với chủ nhà rằng phòng đã được dọn dẹp và bạn sẽ được giảm giá 20% cho đêm đầu tiên. Bạn có hài lòng với giải pháp này không?",
        createdAt: "2023-06-17T11:30:00Z",
      },
    ],
  };

  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // In a real app, you would call an API to update the complaint status
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    // In a real app, you would call an API to update the complaint priority
  };

  const handleAssignedToChange = (newAssignedTo: string) => {
    setAssignedTo(newAssignedTo);
    // In a real app, you would call an API to update the assigned admin
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    // In a real app, you would call an API to send the message
    setTimeout(() => {
      setNewMessage("");
      setIsSubmitting(false);
      // Here you would typically update the messages list with the new message
      // For this demo, we're just clearing the input
    }, 1000);
  };

  const handleResolve = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to resolve the complaint
    setTimeout(() => {
      setStatus("resolved");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleClose = () => {
    setIsSubmitting(true);
    // In a real app, you would call an API to close the complaint
    setTimeout(() => {
      setStatus("closed");
      setIsSubmitting(false);
    }, 1000);
  };

  // Mock admin list for assignment
  const adminList = [
    { id: "admin1", name: "Nguyễn Admin" },
    { id: "admin2", name: "Trần Quản Lý" },
    { id: "admin3", name: "Lê Support" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/complaints">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Complaint #{params.id}
          </h2>
          <p className="text-muted-foreground">
            Submitted by{" "}
            <Link
              href={`/admin/customers/${complaint.customerId}`}
              className="text-blue-600 hover:underline"
            >
              {complaint.customerName}
            </Link>{" "}
            on {formatDate(complaint.createdAt)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className={getStatusColor(status)}>
            {formatStatus(status)}
          </Badge>
          <Badge className={getPriorityColor(priority)}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{complaint.subject}</CardTitle>
              <CardDescription>
                Complaint details and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="text-base mt-1">{complaint.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Booking ID</p>
                    <Link
                      href={`/admin/bookings/${complaint.bookingId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {complaint.bookingId}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Homestay</p>
                    <Link
                      href={`/admin/homestays/${complaint.homestayId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {complaint.homestayName}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="text-sm">{complaint.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="text-sm">{complaint.checkOut}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                Communication history regarding this complaint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {complaint.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-4 max-w-[80%] ${
                        message.senderType === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : message.senderType === "owner"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          {message.senderName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Reply</h3>
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.trim()}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-base font-medium">
                    {complaint.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-base">{complaint.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-base">{complaint.customerPhone}</p>
                </div>
              </div>
              <Link href={`/admin/customers/${complaint.customerId}`}>
                <Button variant="outline" className="w-full">
                  View Customer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaint Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To</label>
                <Select
                  value={assignedTo}
                  onValueChange={handleAssignedToChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminList.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                {status !== "resolved" && status !== "closed" && (
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    onClick={handleResolve}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                )}
                {status !== "closed" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Close Complaint
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
