import { Bell } from "lucide-react";

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case "booking":
      return <span className="text-xl">🏠</span>;
    case "review":
      return <span className="text-xl">⭐</span>;
    case "cancellation":
      return <span className="text-xl">❌</span>;
    case "approval":
      return <span className="text-xl">✅</span>;
    case "complaint":
      return <span className="text-xl">⚠️</span>;
    case "system":
      return <span className="text-xl">🔔</span>;
    default:
      return <Bell className="h-5 w-5" />;
  }
};
