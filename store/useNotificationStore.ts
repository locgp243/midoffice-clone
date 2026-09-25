import { notificationServices } from "@/services/notificationServices";
import { NotificationData } from "@/types/Notifications";
import { create } from "zustand";

interface NotificationState {
  notifications: NotificationData[];
  unseenCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  seenNotification: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unseenCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const response = await notificationServices.getNotifications(0, 20);
      if (!response.result) {
        throw new Error(response.message);
      }

      set({
        notifications: response.data ?? [],
        unseenCount: response.options?.unseen_count ?? 0,
      });
    } catch (error: any) {
      console.log("lấy thông báo thất bại:", error?.response?.data ?? error);
    } finally {
      set({ isLoading: false });
    }
  },

  seenNotification: async (notificationId) => {
    try {
      console.log("check id noti:", notificationId);

      const response =
        await notificationServices.seenNotification(notificationId);

      console.log("check dataa:", response);

      if (!response.result) {
        throw new Error(response.message || "Không thể cập nhật thông báo.");
      }

      set((state) => {
        const notification = state.notifications.find(
          (item) => item.id === notificationId,
        );

        if (!notification || notification.is_seen === 1) {
          return state;
        }

        return {
          notifications: state.notifications.map((item) =>
            item.id === notificationId ? { ...item, is_seen: 1 } : item,
          ),
          unseenCount: Math.max(0, state.unseenCount - 1),
        };
      });
    } catch (error) {
      console.log("thông báo gặp lỗi:", error);
      throw error;
    }
  },
}));
