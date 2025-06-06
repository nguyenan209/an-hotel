"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

interface ConfirmationStepProps {
  data: any;
}

export default function ConfirmationStep({ data }: ConfirmationStepProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getPackageName = (packageType: string) => {
    const names = {
      basic: "Basic",
      premium: "Premium",
      enterprise: "Enterprise",
    };
    return names[packageType as keyof typeof names] || packageType;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Đăng ký thành công!
        </h2>
        <p className="text-gray-600">
          Cảm ơn bạn đã đăng ký làm Host. Chúng tôi sẽ xem xét hồ sơ của bạn
          trong vòng 24-48 giờ.
        </p>
      </div>

      {/* Registration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Thông tin đăng ký
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium">{data.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Điện thoại:</span>
                <span className="font-medium">{data.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span className="text-sm text-gray-600">Địa chỉ:</span>
                <span className="font-medium">{data.homestayAddress}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                <Badge variant="secondary">
                  {getPackageName(data.packageType)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-medium text-green-600">
                  {formatPrice(data.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Đang xem xét
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Các bước tiếp theo</CardTitle>
          <CardDescription>Những gì sẽ xảy ra sau khi đăng ký</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium">Xem xét hồ sơ (24-48h)</h4>
                <p className="text-sm text-gray-600">
                  Đội ngũ của chúng tôi sẽ xem xét thông tin và liên hệ với bạn
                  để xác minh.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium">Thiết lập tài khoản Host</h4>
                <p className="text-sm text-gray-600">
                  Sau khi được duyệt, bạn sẽ nhận được thông tin đăng nhập vào
                  hệ thống quản lý Host.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium">Tạo listing đầu tiên</h4>
                <p className="text-sm text-gray-600">
                  Hướng dẫn tạo listing homestay và bắt đầu đón khách.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium mb-2">Cần hỗ trợ?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng
              tôi.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Liên hệ hỗ trợ
                </Button>
              </Link>
              <Link href="mailto:host-support@homestay.com">
                <Button variant="outline" size="sm">
                  Email hỗ trợ
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            Về trang chủ
          </Button>
        </Link>
        <Link href="/owner" className="flex-1">
          <Button className="w-full">Vào trang quản lý Host</Button>
        </Link>
      </div>
    </div>
  );
}
