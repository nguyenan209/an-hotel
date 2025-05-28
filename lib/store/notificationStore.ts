import { create } from "zustand";
import { Notification } from "@/lib/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  totalNotifications: number;
  totalPages: number;
  isLoading: boolean;
  fetchNotifications: (params: {
    page: number;
    limit: number;
    type: string;
    status: string;
    query: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalNotifications: 0,
  totalPages: 0,
  isLoading: false,

  fetchNotifications: async ({ page, limit, type, status, query }) => {
    set({ isLoading: true });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?page=${page}&limit=${limit}&type=${type}&status=${status}&query=${query}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      set({
        notifications: data.notifications,
        unreadCount: data.pagination.unreadCount,
        totalNotifications: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        ),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAsUnread: async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: false }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as unread");
      }

      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: false } : notif
        ),
        unreadCount: state.unreadCount + 1,
      }));
    } catch (error) {
      console.error("Error marking notification as unread:", error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      set((state) => {
        const deletedNotification = state.notifications.find(
          (notif) => notif.id === id
        );
        return {
          notifications: state.notifications.filter((notif) => notif.id !== id),
          unreadCount:
            deletedNotification && !deletedNotification.isRead
              ? state.unreadCount - 1
              : state.unreadCount,
          totalNotifications: state.totalNotifications - 1,
        };
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
}));
