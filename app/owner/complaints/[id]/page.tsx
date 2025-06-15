"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MessageSquare, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

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
import { useAuth } from "@/context/AuthContext";
import { ComplaintPriority, ComplaintStatus } from "@prisma/client";

export default function ComplaintDetailPage() {
    const params = useParams();
    const { id } = params;
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState("");
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const showConversation = searchParams.get("chat") === "true";

    const { data: complaint, isLoading } = useQuery({
        queryKey: ['complaint', id],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/complaints/${id}`);
            if (!res.ok) throw new Error("Failed to fetch complaint");
            return res.json();
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/complaints/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaint', id] });
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/complaints/${id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!res.ok) throw new Error("Failed to send message");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaint', id] });
            setNewMessage("");
        }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return "bg-red-100 text-red-800";
      case ComplaintStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case ComplaintStatus.CLOSED:
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
      case ComplaintStatus.CLOSED:
        return "Closed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const formatPriority = (priority: string) => {
    switch (priority) {
      case ComplaintPriority.HIGH:
        return "High";
      case ComplaintPriority.MEDIUM:
        return "Medium";
      case ComplaintPriority.LOW:
        return "Low";
      default:
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleResolve = () => {
    updateStatusMutation.mutate(ComplaintStatus.RESOLVED);
  };

  const handleClose = () => {
    updateStatusMutation.mutate(ComplaintStatus.CLOSED);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/owner/complaints">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Complaint #{id}</h2>
          <p className="text-muted-foreground">
            Submitted by{" "}
            <Link
              href={`/owner/customers/${complaint?.customerId}`}
              className="text-blue-600 hover:underline"
            >
              {complaint?.customer?.user?.name || "-"}
            </Link>{" "}
            on {formatDate(complaint?.createdAt)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className={getStatusColor(complaint?.status)}>
            {formatStatus(complaint?.status)}
          </Badge>
          <Badge className={getPriorityColor(complaint?.priority)}>
            {formatPriority(complaint?.priority)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{complaint?.subject}</CardTitle>
              <CardDescription>
                Complaint details and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <div
                  className="text-base mt-1"
                  dangerouslySetInnerHTML={{ __html: complaint?.description || "" }}
                />
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
                      href={`/owner/bookings/${complaint?.booking?.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {complaint?.booking?.id}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Homestay</p>
                    <Link
                      href={`/owner/homestays/${complaint?.booking?.homestay?.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {complaint?.booking?.homestay?.name}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="text-sm">{complaint?.booking?.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="text-sm">{complaint?.booking?.checkOut}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {showConversation && (
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  Communication history regarding this complaint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {(complaint?.responses && complaint.responses.length > 0) ? (
                    complaint.responses.map((message: any) => {
                      const isCurrentUser =
                        message.responderType === "OWNER" &&
                        user &&
                        message.responderName === user.name;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`rounded-lg p-4 max-w-[80%] ${
                              isCurrentUser
                                ? "bg-green-100 text-green-800"
                                : message.responderType === "ADMIN"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4" />
                              <p className="text-sm font-medium">
                                {message.responderName}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground">No conversation yet.</div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Reply</h3>
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    disabled={sendMessageMutation.isPending}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                    {complaint?.customer?.user?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-base">{complaint?.customer?.user?.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-base">{complaint?.customer?.user?.phone || "-"}</p>
                </div>
              </div>
              <Link href={`/owner/customers/${complaint?.customerId}`}>
                <Button variant="outline" className="w-full">
                  View Customer
                </Button>
              </Link>
            </CardContent>
          </Card>

          {complaint?.status !== ComplaintStatus.CLOSED && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  {complaint?.status !== ComplaintStatus.RESOLVED && (
                    <Button
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                      onClick={handleResolve}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                    disabled={updateStatusMutation.isPending}
                  >
                    Close Complaint
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
