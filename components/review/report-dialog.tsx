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
import { ReportReason } from "@prisma/client";

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
  const [reportReason, setReportReason] = useState<ReportReason>(
    ReportReason.INAPPROPRIATE
  );
  const [reportDetails, setReportDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!review) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });

      if (!response.ok) {
        console.error("Failed to submit report:", await response.json());
      } else {
        console.log("Report submitted successfully");
        onOpenChange(false); // Close the dialog after successful submission
      }
    } catch (error) {
      console.error("Error submitting report:", error);
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
            <Select
              value={reportReason}
              onValueChange={(value) => setReportReason(value as ReportReason)}
            >
              <SelectTrigger id="report-reason">
                <SelectValue placeholder="Chọn lý do báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportReason.INAPPROPRIATE}>
                  Nội dung không phù hợp
                </SelectItem>
                <SelectItem value={ReportReason.SPAM}>
                  Spam hoặc quảng cáo
                </SelectItem>
                <SelectItem value={ReportReason.FAKE}>
                  Đánh giá giả mạo
                </SelectItem>
                <SelectItem value={ReportReason.OFFENSIVE}>
                  Nội dung xúc phạm
                </SelectItem>
                <SelectItem value={ReportReason.OTHER}>Lý do khác</SelectItem>
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
