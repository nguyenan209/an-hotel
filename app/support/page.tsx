import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Support | HomeStay",
  description:
    "Get help with your bookings, account, or report issues with your stay",
};

export default function SupportPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Làm thế nào để chúng tôi có thể giúp bạn?
          </h1>
          <p className="text-muted-foreground">
            Đội ngũ hỗ trợ của chúng tôi sẽ giúp bạn với bất kỳ câu hỏi hoặc vấn
            đề nào bạn có.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Gửi khiếu nại
              </CardTitle>
              <CardDescription>
                Báo cáo vấn đề với đặt phòng, homestay, hoặc chủ homestay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Nếu bạn đã gặp phải bất kỳ vấn đề nào với đặt phòng, homestay,
                hoặc chủ homestay, vui lòng gửi khiếu nại và đội ngũ của chúng
                tôi sẽ xử lý nó ngay lập tức.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/support/complaints">Gửi khiếu nại</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Chat trực tiếp
              </CardTitle>
              <CardDescription>
                Chat với đội ngũ hỗ trợ của chúng tôi trực tiếp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Nhận sự trợ giúp tức thời từ đội ngũ hỗ trợ của chúng tôi thông
                qua dịch vụ chat trực tiếp. Có sẵn 24/7.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Bắt đầu chat
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                Câu hỏi thường gặp
              </CardTitle>
              <CardDescription>
                Tìm câu trả lời cho các câu hỏi thường gặp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Duyệt qua các câu hỏi thường gặp của chúng tôi để tìm câu trả
                lời nhanh cho các câu hỏi thường gặp về đặt phòng, hủy đặt
                phòng, và nhiều hơn nữa.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Xem câu hỏi thường gặp
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                Khiếu nại của tôi
              </CardTitle>
              <CardDescription>
                Theo dõi trạng thái của khiếu nại của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Xem và theo dõi trạng thái của khiếu nại mà bạn đã gửi. Kiểm tra
                các phản hồi và cập nhật từ đội ngũ của chúng tôi.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/support/my-complaints">Xem khiếu nại của tôi</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Hỗ trợ điện thoại</p>
                <p className="text-sm text-muted-foreground">
                  +1 (555) 123-4567
                </p>
                <p className="text-xs text-muted-foreground">Có sẵn 24/7</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Hỗ trợ email</p>
                <p className="text-sm text-muted-foreground">
                  support@homestay.com
                </p>
                <p className="text-xs text-muted-foreground">
                  Phản hồi trong 24 giờ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
