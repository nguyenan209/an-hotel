import { BookingStatus } from "@prisma/client";
import { Badge } from "../ui/badge";


export const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.UPCOMING:
      return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;       // Màu xanh biển
    case BookingStatus.COMPLETED:
      return <Badge className="bg-emerald-500 text-white">Completed</Badge>;   // Màu xanh ngọc
    case BookingStatus.CANCELLED:
      return <Badge className="bg-rose-500 text-white">Cancelled</Badge>;      // Màu đỏ hồng
    case BookingStatus.PENDING:
      return <Badge className="bg-amber-500 text-white">Pending</Badge>;       // Màu vàng cam
    case BookingStatus.PAID:
      return <Badge className="bg-indigo-500 text-white">Paid</Badge>;         // Màu tím xanh
    default:
      return <Badge className="bg-gray-400 text-white">Unknown</Badge>;
  }
};
