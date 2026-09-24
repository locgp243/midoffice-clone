import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_TOKEN_KEY = "device_token";

export const notificationStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem("DEVICE_TOKEN_KEY");
    }
    return SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem("DEVICE_TOKEN_KEY", token);
      return;
    }

    await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
  },

  async deleteToken(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(DEVICE_TOKEN_KEY);
    }

    await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
  },
};
