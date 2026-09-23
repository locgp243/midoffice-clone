import { api } from "@/services/api";
import { NotificationResponse } from "@/types/Notifications";

export const notificationServices = {
  async getNotifications(
    offset = 0,
    limit = 20,
  ): Promise<NotificationResponse> {
    const response = await api.get<NotificationResponse>(
      "/cskh/notification/get-notification",
      {
        params: {
          offset,
          limit,
        },
      },
    );

    return response.data;
  },

  async seenNotification(notificationId: number) {
    const response = await api.put(
      `/cskh/notification/seen-notification/${notificationId}`,
    );

    console.log(
      "NOTIFICATION SERVICE LOADED:",
      Object.keys(notificationServices),
    );

    return response.data;
  },
};
