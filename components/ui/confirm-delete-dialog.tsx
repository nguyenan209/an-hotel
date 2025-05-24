import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  isOpen: boolean; // Trạng thái mở/đóng của dialog
  onClose: () => void; // Hàm đóng dialog
  onConfirm: () => void; // Hàm xử lý khi nhấn nút "Delete"
  itemName?: string; // Tên của item cần xóa (hiển thị trong mô tả)
  isDeleting?: boolean; // Trạng thái đang xóa
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {itemName}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
