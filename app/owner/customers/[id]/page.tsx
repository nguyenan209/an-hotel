"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor } from "@/lib/utils";
import { CustomerFormValues, customerSchema } from "@/lib/schema";
import Loading from "@/components/loading";
import { toast } from "sonner";

interface Customer {
  id: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    avatar?: string;
  };
  bookings: Array<{
    id: string;
    homestayName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/customers/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }
      const data = await response.json();
      form.reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        address: data.user.address,
        status: data.user.status,
      });
      return data;
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/customers/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      toast.success("Customer updated successfully");
      router.push("/owner/customers");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CustomerFormValues) => {
    updateCustomerMutation.mutate(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-red-500">Error loading customer details</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/owner/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Sửa khách hàng: {customer.user.name}
        </h2>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
          <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
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
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Ảnh đại diện"
                            className="h-full w-full object-cover"
                          />
                        ) : customer.user.avatar ? (
                          <img
                            src={customer.user.avatar}
                            alt="Ảnh đại diện khách hàng"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-500" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                        type="button"
                      >
                        <span className="sr-only">Thay đổi ảnh đại diện</span>
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
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đầy đủ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên đầy đủ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email:</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập địa chỉ email"
                            type="email"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại:</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ:</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập địa chỉ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái:</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">
                              Không hoạt động
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử đặt phòng</CardTitle>
                  <CardDescription>
                    Xem tất cả đặt phòng được khách hàng đặt tại homestays của
                    bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        Không tìm thấy đặt phòng
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Khách hàng này chưa đặt phòng tại homestays của bạn.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customer.bookings.map((booking) => (
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
                            <Link href={`/owner/bookings/${booking.id}`}>
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/owner/customers">Hủy</Link>
              </Button>
              <Button type="submit" disabled={updateCustomerMutation.isPending}>
                <Check className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
