"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor } from "@/lib/utils";
import { CustomerFormValues, customerSchema } from "@/lib/schema";

export default function CustomerDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const isNewCustomer = id === "new";
  const [customer, setCustomer] = useState<any | null>(null);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!isNewCustomer);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: isNewCustomer
      ? {
          name: "",
          email: "",
          phone: "",
          address: "",
          status: "active",
        }
      : undefined,
  });

  useEffect(() => {
    if (isNewCustomer) {
      setIsLoading(false);
      return;
    }

    // Gọi API để lấy chi tiết khách hàng
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/customers/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch customer details");
        }

        const data = await response.json();
        setCustomer(data);
        form.reset({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.address,
          status: data.user.status,
        });

        // Lấy danh sách booking của khách hàng
        setCustomerBookings(data.bookings || []);
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id, isNewCustomer, form]);

  const onSubmit = (data: CustomerFormValues) => {
    // Gửi dữ liệu cập nhật đến API
    console.log("Form submitted:", data);

    // Simulate successful submission
    setTimeout(() => {
      router.push("/admin/customers");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewCustomer
            ? "Thêm khách hàng mới"
            : `Sửa khách hàng: ${customer?.user?.name}`}
        </h2>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
          {!isNewCustomer && (
            <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
          )}
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                  <CardDescription>
                    Nhập thông tin cá nhân của khách hàng.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Form fields */}
                  {/* ... */}
                </CardContent>
              </Card>
            </TabsContent>

            {!isNewCustomer && (
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử đặt phòng</CardTitle>
                    <CardDescription>
                      Xem tất cả đặt phòng được khách hàng thực hiện.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {customerBookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          Không tìm thấy đặt phòng nào
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Khách hàng này chưa thực hiện đặt phòng nào.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <h4 className="font-medium">
                                {booking.homestayName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.checkIn} to {booking.checkOut}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                              <Link href={`/admin/bookings/${booking.id}`}>
                                <Button variant="outline" size="sm">
                                  Xem chi tiết
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/customers">Hủy</Link>
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isNewCustomer ? "Tạo khách hàng" : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
