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

export default function PaymentManagementPage() {
  // Mock data for payments
  const mockPayments = [
    {
      id: "PAY-001",
      customer: "Nguyễn Văn An",
      email: "an@example.com",
      homestay: "Sunset Beach Villa",
      amount: 2500000,
      method: "Stripe",
      status: "completed",
      date: "2024-01-15",
      transactionId: "txn_1234567890",
    },
    {
      id: "PAY-002",
      customer: "Trần Thị Bình",
      email: "binh@example.com",
      homestay: "Mountain Retreat",
      amount: 1800000,
      method: "QR Code",
      status: "pending",
      date: "2024-01-14",
      transactionId: "txn_0987654321",
    },
    {
      id: "PAY-003",
      customer: "Lê Văn Cường",
      email: "cuong@example.com",
      homestay: "Riverside Cottage",
      amount: 3200000,
      method: "Bank Transfer",
      status: "failed",
      date: "2024-01-13",
      transactionId: "txn_1122334455",
    },
    {
      id: "PAY-004",
      customer: "Phạm Thị Dung",
      email: "dung@example.com",
      homestay: "City Center Apartment",
      amount: 1500000,
      method: "Stripe",
      status: "completed",
      date: "2024-01-12",
      transactionId: "txn_5566778899",
    },
    {
      id: "PAY-005",
      customer: "Hoàng Văn Em",
      email: "em@example.com",
      homestay: "Lakeside Villa",
      amount: 2800000,
      method: "QR Code",
      status: "refunded",
      date: "2024-01-11",
      transactionId: "txn_9988776655",
    },
  ];

  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleRefund = (payment: any) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const handleConfirmPayment = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      // API call to confirm payment
      console.log("Confirming payment:", paymentId);
      // Update payment status in state or refetch data
      alert("Thanh toán đã được xác nhận!");
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Có lỗi xảy ra khi xác nhận thanh toán!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = (payment: any) => {
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
        ...mockPayments.map((payment) =>
          [
            payment.id,
            `"${payment.customer}"`,
            payment.email,
            `"${payment.homestay}"`,
            payment.amount,
            payment.method,
            payment.status,
            payment.date,
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

      alert("Báo cáo đã được xuất thành công!");
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo!");
    }
  };

  const processRefund = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);
    try {
      // API call to process refund
      console.log("Processing refund for:", selectedPayment.id);
      alert("Hoàn tiền thành công!");
      setShowRefundModal(false);
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Có lỗi xảy ra khi hoàn tiền!");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Thành công
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Đang xử lý
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Thất bại
          </Badge>
        );
      case "refunded":
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
      case "Stripe":
        return <CreditCard className="w-4 h-4" />;
      case "QR Code":
        return <Smartphone className="w-4 h-4" />;
      case "Bank Transfer":
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

  const totalRevenue = mockPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = mockPayments.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingPayments = mockPayments.filter(
    (p) => p.status === "pending"
  ).length;
  const failedPayments = mockPayments.filter(
    (p) => p.status === "failed"
  ).length;

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
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="completed">Thành công</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="qr">QR Code</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
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
                {mockPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{payment.homestay}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        {payment.method}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
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
                          {payment.status === "completed" && (
                            <DropdownMenuItem
                              onClick={() => handleRefund(payment)}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Hoàn tiền
                            </DropdownMenuItem>
                          )}
                          {payment.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleConfirmPayment(payment.id)}
                              disabled={isProcessing}
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
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị 1-{mockPayments.length} của {mockPayments.length} kết quả
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm" disabled>
                Sau
              </Button>
            </div>
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
                    {selectedPayment.customer}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Homestay</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.homestay}
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
                    {selectedPayment.date}
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
                  <span>{selectedPayment.customer}</span>
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
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
