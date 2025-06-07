"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Edit,
  Plus,
  Search,
  UserCog,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { HostPaymentStatus, HostRegistration, HostRegistrationStep, UserStatus } from "@prisma/client";

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | HostRegistrationStep
  >("all");
  const [activeTab, setActiveTab] = useState("active-owners");

  // Infinity scroll state for owners
  const [owners, setOwners] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Host registrations state
  const [registrations, setRegistrations] = useState<HostRegistration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] =
    useState<HostRegistration | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [detailsRegistration, setDetailsRegistration] = useState<HostRegistration | null>(null)

  const PAGE_SIZE = 20;

  // Chuyển string thường về enum HostRegistrationStep
  const normalizeStep = (step: string): HostRegistrationStep => step.toUpperCase() as HostRegistrationStep;

  // Fetch owners with infinite scroll
  const fetchOwners = async (skip = 0, append = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("skip", skip.toString());
      params.set("limit", PAGE_SIZE.toString());
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter && statusFilter !== "all")
        params.set("status", statusFilter);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/admin/owners?${params.toString()}`
      );
      const data = await response.json();
      if (data.success) {
        if (append) {
          setOwners((prev) => [...prev, ...data.data]);
        } else {
          setOwners(data.data);
        }
        setHasMore(data.data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreOwners = () => {
    if (!hasMore || isLoading) return;
    fetchOwners(owners.length, true);
  };

  useEffect(() => {
    fetchOwners(0, false);
  }, [searchQuery, statusFilter]);

  // Fetch host registrations
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/host-registrations`
      );
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đăng ký",
        variant: "destructive",
      });
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || normalizeStep(reg.registrationStep) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Approve registration
  const handleApprove = async (registration: HostRegistration) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/host-registrations/${registration.id}/approve`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Thành công",
          description: "Đã phê duyệt host thành công",
        });
        fetchRegistrations(); // Refresh list
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error approving host:", error);
      toast({
        title: "Lỗi",
        description: "Không thể phê duyệt host",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject registration
  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/host-registrations/${selectedRegistration.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason.trim() }),
        }
      );
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Thành công",
          description: "Đã từ chối đăng ký host",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedRegistration(null);
        fetchRegistrations(); // Refresh list
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error rejecting host:", error);
      toast({
        title: "Lỗi",
        description: "Không thể từ chối đăng ký",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Status icons và badges cho UserStatus
  const getUserStatusIcon = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case UserStatus.INACTIVE:
        return <Clock className="h-4 w-4 text-gray-400" />;
      case UserStatus.SUSPENDED:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case UserStatus.DELETED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getUserStatusBadge = (status: UserStatus) => {
    const statusConfig = {
      [UserStatus.ACTIVE]: {
        label: "Hoạt động",
        className: "bg-green-100 text-green-800",
      },
      [UserStatus.INACTIVE]: {
        label: "Chưa kích hoạt",
        className: "bg-gray-100 text-gray-800",
      },
      [UserStatus.SUSPENDED]: {
        label: "Tạm khóa",
        className: "bg-yellow-100 text-yellow-800",
      },
      [UserStatus.DELETED]: {
        label: "Đã xóa",
        className: "bg-red-100 text-red-800",
      },
    };
    const config = statusConfig[status] || statusConfig[UserStatus.INACTIVE];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Status icons và badges cho HostRegistrationStep
  const getRegistrationStepIcon = (step: HostRegistrationStep) => {
    switch (step) {
      case HostRegistrationStep.INFO:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case HostRegistrationStep.PAYMENT:
        return <Clock className="h-4 w-4 text-orange-500" />;
      case HostRegistrationStep.VERIFICATION:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case HostRegistrationStep.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case HostRegistrationStep.REJECTED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRegistrationStepBadge = (step: HostRegistrationStep) => {
    const stepConfig = {
      [HostRegistrationStep.INFO]: {
        label: "Thông tin",
        className: "bg-blue-100 text-blue-800",
      },
      [HostRegistrationStep.PAYMENT]: {
        label: "Thanh toán",
        className: "bg-orange-100 text-orange-800",
      },
      [HostRegistrationStep.VERIFICATION]: {
        label: "Chờ duyệt",
        className: "bg-yellow-100 text-yellow-800",
      },
      [HostRegistrationStep.APPROVED]: {
        label: "Đã duyệt",
        className: "bg-green-100 text-green-800",
      },
      [HostRegistrationStep.REJECTED]: {
        label: "Từ chối",
        className: "bg-red-100 text-red-800",
      },
    };
    const config = stepConfig[step] || stepConfig[HostRegistrationStep.INFO];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Count pending registrations
  const pendingCount = registrations.filter(
    (reg) => normalizeStep(reg.registrationStep) === HostRegistrationStep.VERIFICATION
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Homestay Owners</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOwners(0, false)}>
            Làm mới
          </Button>
          <Link href="/admin/owners/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Owner
            </Button>
          </Link>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="active-owners">Owners hiện tại</TabsTrigger>
          <TabsTrigger value="pending-registrations" className="relative">
            Đăng ký mới
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-owners">
          <Card>
            <CardHeader>
              <CardTitle>Homestay Owners hiện tại</CardTitle>
              <CardDescription>
                Quản lý các homestay owners đã được phê duyệt và đang hoạt động.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm owners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 max-w-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: "all" | HostRegistrationStep) =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value={UserStatus.ACTIVE}>
                        Hoạt động
                      </SelectItem>
                      <SelectItem value={UserStatus.SUSPENDED}>
                        Tạm khóa
                      </SelectItem>
                      <SelectItem value={UserStatus.DELETED}>
                        Chấm dứt
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border"
                id="owners-scrollable-div"
                style={{ maxHeight: 500, overflowY: "auto" }}
              >
                <InfiniteScroll
                  dataLength={owners.length}
                  next={loadMoreOwners}
                  hasMore={hasMore}
                  loader={<p className="text-center py-4">Đang tải...</p>}
                  endMessage={
                    <p className="text-center py-4 text-muted-foreground">
                      Đã tải hết danh sách owner.
                    </p>
                  }
                  scrollableTarget="owners-scrollable-div"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Điện thoại</TableHead>
                        <TableHead>Homestays</TableHead>
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {owners.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Không tìm thấy owner nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        owners.map((owner) => (
                          <TableRow key={owner.id}>
                            <TableCell className="font-medium">
                              {owner.name}
                            </TableCell>
                            <TableCell>{owner.email}</TableCell>
                            <TableCell>{owner.phone}</TableCell>
                            <TableCell>{owner.totalHomestays}</TableCell>
                            <TableCell>{formatDate(owner.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getUserStatusIcon(owner.status)}
                                {getUserStatusBadge(owner.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/owners/${owner.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Link
                                  href={`/admin/owners/${owner.id}/homestays`}
                                >
                                  <Button variant="ghost" size="icon">
                                    <UserCog className="h-4 w-4" />
                                    <span className="sr-only">
                                      Manage Homestays
                                    </span>
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </InfiniteScroll>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-registrations">
          <Card>
            <CardHeader>
              <CardTitle>Đăng ký Host mới</CardTitle>
              <CardDescription>
                Xem xét và phê duyệt các đơn đăng ký làm Host trên platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 max-w-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: "all" | HostRegistrationStep) =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value={HostRegistrationStep.VERIFICATION}>
                        Chờ duyệt
                      </SelectItem>
                      <SelectItem value={HostRegistrationStep.APPROVED}>
                        Đã duyệt
                      </SelectItem>
                      <SelectItem value={HostRegistrationStep.REJECTED}>
                        Từ chối
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {registrationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thông tin Host</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Địa chỉ Homestay</TableHead>
                        <TableHead>Ngày đăng ký</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-gray-500">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p>Không tìm thấy đăng ký nào</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRegistrations.map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {registration.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {registration.id.slice(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{registration.email}</div>
                                <div className="text-gray-500">
                                  {registration.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div
                                className="text-sm max-w-xs truncate"
                                title={registration.homestayAddress}
                              >
                                {registration.homestayAddress}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(registration.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getRegistrationStepIcon(normalizeStep(registration.registrationStep))}
                                {getRegistrationStepBadge(normalizeStep(registration.registrationStep))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Xem chi tiết"
                                  onClick={() => {
                                    setDetailsRegistration(registration)
                                    setShowDetailsDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {normalizeStep(registration.registrationStep) === HostRegistrationStep.VERIFICATION && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleApprove(registration)
                                      }
                                      disabled={actionLoading}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Phê duyệt"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedRegistration(registration);
                                        setShowRejectDialog(true);
                                      }}
                                      disabled={actionLoading}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Từ chối"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đăng ký Host</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối đăng ký của{" "}
              <strong>{selectedRegistration?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Nhập lý do từ chối (bắt buộc)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              {actionLoading ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
            {/* Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đăng ký Host</DialogTitle>
            <DialogDescription>Thông tin chi tiết về đăng ký làm Host</DialogDescription>
          </DialogHeader>

          {detailsRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Thông tin cá nhân</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium">Họ tên:</span> {detailsRegistration.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {detailsRegistration.email}
                    </div>
                    <div>
                      <span className="font-medium">Số điện thoại:</span> {detailsRegistration.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Thông tin đăng ký</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium">ID:</span> {detailsRegistration.id}
                    </div>
                    <div>
                      <span className="font-medium">Ngày đăng ký:</span> {formatDate(detailsRegistration.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {getRegistrationStepBadge(detailsRegistration.registrationStep)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Địa chỉ Homestay</h3>
                <p className="mt-2">{detailsRegistration.homestayAddress}</p>
              </div>

              {detailsRegistration.experience && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Kinh nghiệm</h3>
                  <p className="mt-2">{detailsRegistration.experience}</p>
                </div>
              )}

              {detailsRegistration.paymentStatus && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Thông tin thanh toán</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      <Badge
                        className={
                          detailsRegistration.paymentStatus === HostPaymentStatus.PAID
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {detailsRegistration.paymentStatus === HostPaymentStatus.PAID ? "Đã thanh toán" : "Chưa thanh toán"}
                      </Badge>
                    </div>
                    {detailsRegistration.paymentStatus === HostPaymentStatus.PAID && (
                      <div>
                        <span className="font-medium">Số tiền:</span>{" "}
                        {detailsRegistration.setupFeeAmount?.toLocaleString()} VNĐ
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailsRegistration.registrationStep === HostRegistrationStep.VERIFICATION && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false)
                      setSelectedRegistration(detailsRegistration)
                      setShowRejectDialog(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailsDialog(false)
                      handleApprove(detailsRegistration)
                    }}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Phê duyệt
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
