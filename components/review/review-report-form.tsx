import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function ReportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (details: string) => void;
  onCancel: () => void;
}) {
  const [details, setDetails] = useState("");

  return (
    <div>
      <Textarea
        id="report-details"
        placeholder="Vui lòng cung cấp thêm thông tin về vấn đề bạn gặp phải..."
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={4}
      />
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={() => onSubmit(details)}>Gửi báo cáo</Button>
      </div>
    </div>
  );
}

export default ReportForm;
