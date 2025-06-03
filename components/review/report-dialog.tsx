"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReviewResponse } from "@/lib/types";
import { useState } from "react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewResponse | null;
  onSubmit: (reason: string, details: string) => Promise<void>;
}

export function ReportDialog({
  open,
  onOpenChange,
  review,
  onSubmit,
}: ReportDialogProps) {
  const [reportReason, setReportReason] = useState<string>("inappropriate");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(reportReason, reportDetails);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Báo cáo đánh giá</DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn báo cáo đánh giá này. Chúng
            tôi sẽ xem xét và có biện pháp xử lý phù hợp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Lý do báo cáo</Label>
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger id="report-reason">
                <SelectValue placeholder="Chọn lý do báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate">
                  Nội dung không phù hợp
                </SelectItem>
                <SelectItem value="spam">Spam hoặc quảng cáo</SelectItem>
                <SelectItem value="fake">Đánh giá giả mạo</SelectItem>
                <SelectItem value="offensive">Nội dung xúc phạm</SelectItem>
                <SelectItem value="other">Lý do khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Chi tiết (không bắt buộc)</Label>
            <Textarea
              id="report-details"
              placeholder="Vui lòng cung cấp thêm thông tin..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
