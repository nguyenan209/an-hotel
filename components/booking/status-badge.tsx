import { BookingStatus } from "@prisma/client";
import { Badge } from "../ui/badge";


export const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.UPCOMING:
      return <Badge className="bg-blue-500">Upcoming</Badge>;
    case BookingStatus.COMPLETED:
      return <Badge className="bg-green-500">Completed</Badge>;
    case BookingStatus.CANCELLED:
      return <Badge className="bg-red-500">Cancelled</Badge>;
    case BookingStatus.PENDING:
      return <Badge className="bg-yellow-500">Pending</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};
