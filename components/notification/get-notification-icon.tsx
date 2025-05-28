import { NotificationType } from "@prisma/client";
import { Bell } from "lucide-react";

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case NotificationType.BOOKING:
      return <span className="text-xl">🏠</span>;
    case NotificationType.REVIEW:
      return <span className="text-xl">⭐</span>;
    case NotificationType.CANCELLED:
      return <span className="text-xl">❌</span>;
    case NotificationType.APPROVAL:
      return <span className="text-xl">✅</span>;
    case NotificationType.COMPLAINT:
      return <span className="text-xl">⚠️</span>;
    case NotificationType.SYSTEM:
      return <span className="text-xl">🔔</span>;
    default:
      return <Bell className="h-5 w-5" />;
  }
};
