import { notificationStorage } from "@/utils/notificationStorage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const pushNotificationServices = {
  async initialize(): Promise<string | null> {
    if (Platform.OS === "web") {
      return null;
    }

    if (!Device.isDevice) {
      return null;
    }

    const currentPermission = await Notifications.getPermissionsAsync();

    let status = currentPermission.status;
    console.log("check status permision token: ", status);

    if (status !== "granted") {
      const permission = await Notifications.requestPermissionsAsync();

      status = permission.status;
    }

    if (status !== "granted") {
      return null;
    }

    const token = await Notifications.getDevicePushTokenAsync();
    console.log("check token: ", token);

    const deviceToken = token.data;

    console.log("check device token: ", deviceToken);

    if (typeof deviceToken !== "string") {
      return null;
    }

    await notificationStorage.setToken(deviceToken);

    return deviceToken;
  },

  async getToken(): Promise<string | null> {
    return notificationStorage.getToken();
  },
};
