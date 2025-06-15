"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplaintStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Loading from "@/components/loading";

export default function MyComplaintsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Lấy complaints từ API bằng React Query
  const {
    data,
    isLoading: queryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: async () => {
      const res = await fetch("/api/complaints");
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
  });
  const complaints = data?.complaints || [];

  const filteredComplaints = complaints.filter((complaint: any) => {
    if (activeTab === "all") return true;
    if (activeTab === ComplaintStatus.OPEN)
      return complaint.status === ComplaintStatus.OPEN;
    if (activeTab === ComplaintStatus.RESOLVED)
      return complaint.status === ComplaintStatus.RESOLVED;
    if (activeTab === ComplaintStatus.ACKNOWLEDGED)
      return complaint.status === ComplaintStatus.ACKNOWLEDGED;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return <Badge className="bg-blue-500">Open</Badge>;
      case ComplaintStatus.RESOLVED:
        return <Badge className="bg-green-500">Resolved</Badge>;
      case ComplaintStatus.ACKNOWLEDGED:
        return <Badge variant="outline">Acknowledged</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return <Clock className="h-5 w-5 text-blue-500" />;
      case ComplaintStatus.RESOLVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ComplaintStatus.ACKNOWLEDGED:
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const truncateHtml = (html: string, maxLength: number) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    if (text.length <= maxLength) return html;
    return text.substring(0, maxLength) + "...";
  };

  if (queryLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-lg text-red-500">Failed to load complaints.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Homepage
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Complaints</h1>
          <p className="text-muted-foreground mb-6">
            Track and manage the complaints you've submitted.
          </p>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value={ComplaintStatus.OPEN}>Open</TabsTrigger>
            <TabsTrigger value={ComplaintStatus.RESOLVED}>Resolved</TabsTrigger>
            <TabsTrigger value={ComplaintStatus.ACKNOWLEDGED}>
              Acknowledged
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  You haven't submitted any complaints yet.
                </p>
              </div>
            ) : (
              filteredComplaints.map((complaint: any) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))
            )}
          </TabsContent>

          <TabsContent value={ComplaintStatus.OPEN} className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  You don't have any open complaints.
                </p>
              </div>
            ) : (
              filteredComplaints.map((complaint: any) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))
            )}
          </TabsContent>

          <TabsContent value={ComplaintStatus.RESOLVED} className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  You don't have any resolved complaints.
                </p>
              </div>
            ) : (
              filteredComplaints.map((complaint: any) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))
            )}
          </TabsContent>

          <TabsContent
            value={ComplaintStatus.ACKNOWLEDGED}
            className="space-y-6"
          >
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  You don't have any closed complaints.
                </p>
              </div>
            ) : (
              filteredComplaints.map((complaint: any) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function ComplaintCard({ complaint }: { complaint: any }) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getStatusIcon(complaint.status)}
              <div>
                <CardTitle>{complaint.subject}</CardTitle>
                <CardDescription>
                  Regarding booking at {complaint.homestayName} • Submitted on{" "}
                  {formatDate(complaint.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div>{getStatusBadge(complaint.status)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h4>
              <div
                className="text-sm line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: truncateHtml(complaint.description || "", 150),
                }}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              window.location.href = `/support/my-complaints/${complaint.id}`;
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  }
}
