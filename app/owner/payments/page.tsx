"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import Loading from "@/components/loading";
import { toast } from "sonner";

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  booking: {
    customer: {
      name: string;
      email: string;
    };
    homestay: {
      name: string;
    };
  };
}

interface PaymentsResponse {
  payments: Payment[];
  hasMore: boolean;
}

async function fetchPayments({
  pageParam = 0,
  status,
  method,
  search,
}: {
  pageParam: number;
  status: string;
  method: string;
  search: string;
}): Promise<PaymentsResponse> {
  const params = new URLSearchParams({
    skip: (pageParam * 10).toString(),
    limit: "10",
    status: status !== "all" ? status : "",
    method: method !== "all" ? method : "",
    search: search,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/owner/payments?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }
  return response.json();
}

export default function PaymentManagementPage() {
  const [filters, setFilters] = useState({
    status: "all",
    method: "all",
    search: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRefundSuccessModal, setShowRefundSuccessModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["payments", filters],
    queryFn: ({ pageParam }) =>
      fetchPayments({
        pageParam,
        status: filters.status,
        method: filters.method,
        search: filters.search,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.payments.length / 10;
    },
    initialPageParam: 0,
  });

  const refundMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/payments/${paymentId}/refund`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to process refund");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowRefundModal(false);
      setShowRefundSuccessModal(true);
      toast.success("Refund processed successfully");
    },
    onError: () => {
      toast.error("Failed to process refund");
    },
  });

  const payments = data?.pages.flatMap((page) => page.payments) ?? [];

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleMethodChange = (value: string) => {
    setFilters((prev) => ({ ...prev, method: value }));
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      // API call to confirm payment
      console.log("Confirming payment:", paymentId);
      // Update payment status in state or refetch data
      alert("Thanh toán đã được xác nhận!");
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Có lỗi xảy ra khi xác nhận thanh toán!");
    }
  };

  const handleDownloadInvoice = (payment: Payment) => {
    // Generate and download invoice
    console.log("Downloading invoice for:", payment.id);
    alert(`Đang tải hóa đơn cho ${payment.id}...`);
  };

  const handleExportReport = () => {
    try {
      // Create CSV content
      const headers = [
        "ID",
        "Khách hàng",
        "Email",
        "Homestay",
        "Số tiền",
        "Phương thức",
        "Trạng thái",
        "Ngày",
        "Mã giao dịch",
      ];
      const csvContent = [
        headers.join(","),
        ...payments.map((payment) =>
          [
            payment.id,
            `"${payment.booking.customer.name}"`,
            payment.booking.customer.email,
            `"${payment.booking.homestay.name}"`,
            payment.amount,
            payment.method,
            payment.status,
            new Date(payment.createdAt).toLocaleDateString(),
            payment.transactionId,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `payment-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Báo cáo đã được xuất thành công!");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Có lỗi xảy ra khi xuất báo cáo!");
    }
  };

  const processRefund = async () => {
    if (!selectedPayment) return

    try {
      // API call to process refund
      console.log("Processing refund for:", selectedPayment.id)
      setShowRefundModal(false)
      setShowRefundSuccessModal(true)
    } catch (error) {
      console.error("Error processing refund:", error)
      alert("Có lỗi xảy ra khi hoàn tiền!")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Thành công
          </Badge>
        );
      case PaymentStatus.PENDING:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Đang xử lý
          </Badge>
        );
      case PaymentStatus.FAILED:
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Thất bại
          </Badge>
        );
      case PaymentStatus.REFUNDED:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <RefreshCw className="w-3 h-3 mr-1" />
            Đã hoàn tiền
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return <CreditCard className="w-4 h-4" />;
      case PaymentMethod.BANK_TRANSFER:
        return <Smartphone className="w-4 h-4" />;
      case PaymentMethod.CASH:
        return <Banknote className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalRevenue = payments
    .filter((p) => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = payments.filter(
    (p) => p.status === PaymentStatus.PAID
  ).length;
  const pendingPayments = payments.filter(
    (p) => p.status === PaymentStatus.PENDING
  ).length;
  const failedPayments = payments.filter(
    (p) => p.status === PaymentStatus.FAILED
  ).length;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error loading payments</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý thanh toán
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tất cả các giao dịch thanh toán
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Thanh toán thành công
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              -2.1% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Thanh toán thất bại
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">
              -5.3% so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thanh toán</CardTitle>
          <CardDescription>
            Quản lý và theo dõi tất cả các giao dịch thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo ID, khách hàng, homestay..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={PaymentStatus.PAID}>Thành công</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>Đang xử lý</SelectItem>
                <SelectItem value={PaymentStatus.FAILED}>Thất bại</SelectItem>
                <SelectItem value={PaymentStatus.REFUNDED}>Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.method} onValueChange={handleMethodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table with Infinite Scroll */}
          <div className="rounded-md border">
            <InfiniteScroll
              dataLength={payments.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="text-center py-4">
                  {isFetchingNextPage ? "Đang tải..." : ""}
                </div>
              }
              endMessage={
                <div className="text-center py-4 text-muted-foreground">
                  Không còn dữ liệu để tải
                </div>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.transactionId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.booking.customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.booking.customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.booking.homestay.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          {payment.method}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {payment.status === PaymentStatus.PAID && (
                              <DropdownMenuItem
                                onClick={() => handleRefund(payment)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Hoàn tiền
                              </DropdownMenuItem>
                            )}
                            {payment.status === PaymentStatus.PENDING && (
                              <DropdownMenuItem
                                onClick={() => handleConfirmPayment(payment.id)}
                                disabled={refundMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Xác nhận
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDownloadInvoice(payment)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Tải hóa đơn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          </div>
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về giao dịch thanh toán
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID Thanh toán</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mã giao dịch</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.transactionId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Khách hàng</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.booking.customer.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.booking.customer.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Homestay</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.booking.homestay.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phương thức</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.method}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Số tiền</Label>
                  <p className="text-sm font-semibold">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ngày thanh toán</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn tiền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hoàn tiền cho giao dịch này?
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Mã thanh toán:</span>
                  <span>{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Khách hàng:</span>
                  <span>{selectedPayment.booking.customer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Số tiền hoàn:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="refund-reason">Lý do hoàn tiền</Label>
                <Textarea
                  id="refund-reason"
                  placeholder="Nhập lý do hoàn tiền..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={processRefund}
              disabled={refundMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {refundMutation.isPending ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
            {/* Refund Success Modal */}
            <Dialog open={showRefundSuccessModal} onOpenChange={setShowRefundSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Hoàn tiền thành công
            </DialogTitle>
            <DialogDescription>Giao dịch hoàn tiền đã được xử lý thành công.</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Mã thanh toán:</span>
                  <span>{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Khách hàng:</span>
                  <span>{selectedPayment.booking.customer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Số tiền đã hoàn:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(selectedPayment.amount)}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Khách hàng sẽ nhận được tiền hoàn trong vòng 3-5 ngày làm việc.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowRefundSuccessModal(false)} className="bg-green-600 hover:bg-green-700">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
