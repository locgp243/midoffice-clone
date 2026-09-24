import { authService } from "@/services/authServices";
import { UserProfile, userServices } from "@/services/userServices";
import { authUser } from "@/types/Auth";

import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { pushNotificationServices } from "@/services/pushNotificationServices";

interface AuthState {
  user: authUser | null;

  userDetail: UserProfile | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  isInitialized: boolean;

  initializeAuth: () => Promise<void>;

  refreshUserDetail: () => Promise<void>;

  login: (username: string, password: string) => Promise<void>;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  userDetail: null,

  isAuthenticated: false,

  isLoading: false,

  isInitialized: false,

  initializeAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");

      const userId = await SecureStore.getItemAsync("user_id");

      console.log("USER ID:", userId);

      console.log("HAS TOKEN:", !!token);

      if (!token || !userId) {
        set({
          user: null,

          userDetail: null,

          isAuthenticated: false,

          isInitialized: true,
        });

        return;
      }

      const id = Number(userId);

      if (Number.isNaN(id)) {
        throw new Error("User ID không hợp lệ.");
      }

      const userDetail = await userServices.getDetail(id);

      set({
        userDetail,

        isAuthenticated: true,

        isInitialized: true,
      });
    } catch (error) {
      console.log("INITIALIZE AUTH ERROR:", error);

      await SecureStore.deleteItemAsync("access_token");

      await SecureStore.deleteItemAsync("refresh_token");

      await SecureStore.deleteItemAsync("user_id");

      set({
        user: null,

        userDetail: null,

        isAuthenticated: false,

        isInitialized: true,
      });
    }
  },

  refreshUserDetail: async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync("user_id");

      if (!storedUserId) {
        throw new Error("Không tìm thấy User ID.");
      }

      const userId = Number(storedUserId);

      if (Number.isNaN(userId)) {
        throw new Error("User ID không hợp lệ.");
      }

      const profile = await userServices.getDetail(userId);

      set({
        userDetail: profile,
      });
    } catch (error) {
      console.log("REFRESH USER DETAIL ERROR:", error);

      throw error;
    }
  },

  login: async (username, password) => {
    try {
      set({
        isLoading: true,
      });

      const deviceToken = await pushNotificationServices.getToken();
      const response = await authService.login({
        username,
        password,
        provider: "web",
        device_token: deviceToken ?? "",
      });

      console.log("check response đã gửi toekn chưa: ", response);

      if (!response.result) {
        throw new Error(response.message || "Đăng nhập thất bại.");
      }

      const user = response.data?.[0];

      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }

      if (!user.token) {
        throw new Error("API không trả về access token.");
      }

      await SecureStore.setItemAsync("access_token", user.token);

      await SecureStore.setItemAsync("refresh_token", user.refreshToken);

      await SecureStore.setItemAsync("user_id", user.userId.toString());

      const userDetail = await userServices.getDetail(user.userId);

      set({
        user,

        userDetail,

        isAuthenticated: true,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  /*
   * Đăng xuất
   */
  logout: async () => {
    await SecureStore.deleteItemAsync("access_token");

    await SecureStore.deleteItemAsync("refresh_token");

    await SecureStore.deleteItemAsync("user_id");

    set({
      user: null,

      userDetail: null,

      isAuthenticated: false,
    });
  },
}));
