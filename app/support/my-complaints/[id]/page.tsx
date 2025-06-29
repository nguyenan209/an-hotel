"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ComplaintStatus } from "@prisma/client";
import { useParams } from "next/navigation";
import Loading from "@/components/loading";

// Types
interface ComplaintResponse {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "customer" | "admin" | "owner";
  message: string;
  createdAt: string;
  isAdmin: boolean;
}

interface Complaint {
  id: string;
  subject: string;
  description: string;
  customer: {
    user: {
      name: string;
      email: string;
      phone: string;
    };
  };
  booking: {
    id: string;
    bookingNumber: string;
    checkIn: string;
    checkOut: string;
    homestay: {
      id: string;
      name: string;
    };
  };
  priority: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  responses: ComplaintResponse[];
}

// API functions
const fetchComplaint = async (id: string): Promise<Complaint> => {
  const response = await fetch(`/api/admin/complaints/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch complaint");
  }
  return response.json();
};

export default function ComplaintDetailPage() {
  const { id } = useParams();

  // Fetch complaint data
  const {
    data: complaint,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => fetchComplaint(id as string),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return "bg-red-100 text-red-800";
      case ComplaintStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case ComplaintStatus.ACKNOWLEDGED:
        return "bg-gray-100 text-gray-800";
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
      case ComplaintStatus.ACKNOWLEDGED:
        return "Acknowledged";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Lỗi khi tải khiếu nại
            </h2>
            <p className="text-gray-600 mb-4">
              Không thể tải chi tiết khiếu nại. Vui lòng thử lại sau.
            </p>
            <Button variant="outline" asChild>
              <Link href="/support/my-complaints">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại khiếu nại
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/support/my-complaints">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại khiếu nại
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{complaint.subject}</h1>
              <p className="text-muted-foreground">
                Khiếu nại #{complaint.id} • {formatDate(complaint.createdAt)}
              </p>
            </div>
            <Badge className={getStatusColor(complaint.status)}>
              {formatStatus(complaint.status)}
            </Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mô tả khiếu nại</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: complaint.description }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
