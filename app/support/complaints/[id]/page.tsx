"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { ConversationHistory } from "@/components/complaint/conversation-history";

interface ComplaintDetailPageProps {
  params: {
    id: string;
  };
}

export default function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  // Mock data for the complaint
  const [complaint, setComplaint] = useState({
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
    messages: [
      {
        id: "msg1",
        senderId: "cust1",
        senderName: "Lê Minh",
        senderType: "customer",
        message:
          "Tôi rất thất vọng về tình trạng phòng khi chúng tôi đến. Mong được giải quyết sớm.",
        createdAt: "2023-06-15T10:30:00Z",
        isAdmin: false,
      },
      {
        id: "msg2",
        senderId: "admin1",
        senderName: "Nguyễn Admin",
        senderType: "admin",
        message:
          "Xin lỗi về trải nghiệm không tốt của bạn. Chúng tôi đang liên hệ với chủ nhà để giải quyết vấn đề này.",
        createdAt: "2023-06-15T14:45:00Z",
        isAdmin: true,
      },
      {
        id: "msg3",
        senderId: "own1",
        senderName: "Chủ nhà",
        senderType: "owner",
        message:
          "Tôi xin lỗi về sự cố này. Đã có sự nhầm lẫn trong lịch dọn dẹp. Chúng tôi sẽ cử người đến dọn dẹp ngay lập tức và sẽ giảm giá 20% cho đêm đầu tiên.",
        createdAt: "2023-06-16T09:15:00Z",
        isAdmin: true,
      },
      {
        id: "msg4",
        senderId: "admin2",
        senderName: "Trần Quản Lý",
        senderType: "admin",
        message:
          "Chúng tôi đã xác nhận với chủ nhà rằng phòng đã được dọn dẹp và bạn sẽ được giảm giá 20% cho đêm đầu tiên. Bạn có hài lòng với giải pháp này không?",
        createdAt: "2023-06-17T11:30:00Z",
        isAdmin: true,
      },
    ],
  });

  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(
    null
  );
  const [editedMessage, setEditedMessage] = useState<string>("");

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

  const formatStatus = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    // In a real app, you would call an API to send the message
    setTimeout(() => {
      // Add the new message to the conversation
      const newMsg = {
        id: `msg${complaint.messages.length + 1}`,
        senderId: "cust1",
        senderName: "Lê Minh",
        senderType: "customer",
        message: newMessage,
        createdAt: new Date().toISOString(),
        isAdmin: false,
      };

      setComplaint((prev) => ({
        ...prev,
        messages: [...prev.messages, newMsg],
        lastUpdated: new Date().toISOString(),
      }));

      setNewMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/support/complaints">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Complaints
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{complaint.subject}</h1>
              <p className="text-muted-foreground">
                Complaint #{complaint.id} • {formatDate(complaint.createdAt)}
              </p>
            </div>
            <Badge className={getStatusColor(complaint.status)}>
              {formatStatus(complaint.status)}
            </Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complaint Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{complaint.description}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversationHistory
              initialMessage={{
                content: complaint.description,
                createdAt: complaint.createdAt,
              }}
              responses={complaint.messages}
              editingResponseId={editingResponseId}
              editedMessage={editedMessage}
              setEditingResponseId={setEditingResponseId}
              setEditedMessage={setEditedMessage}
              setComplaint={setComplaint}
              isAdmin={false}
            />
          </CardContent>
        </Card>

        {complaint.status !== "closed" && (
          <Card>
            <CardHeader>
              <CardTitle>Reply to this complaint</CardTitle>
              <CardDescription>
                Add more information or respond to the support team's messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your message here..."
                className="min-h-[120px]"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setNewMessage("")}
                disabled={!newMessage || isSubmitting}
              >
                Clear
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Response
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
