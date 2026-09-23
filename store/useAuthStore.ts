import { authService } from "@/services/authServices";
import { UserProfile, userServices } from "@/services/userServices";
import { authUser } from "@/types/Auth";

import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

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

  /*
   * Kiểm tra phiên đăng nhập
   * khi mở ứng dụng.
   */
  initializeAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");

      const userId = await SecureStore.getItemAsync("user_id");

      console.log("USER ID:", userId);

      console.log("HAS TOKEN:", !!token);

      /*
       * Chưa login
       */
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

      /*
       * Lấy thông tin user mới nhất.
       */
      const userDetail = await userServices.getDetail(id);

      set({
        userDetail,

        isAuthenticated: true,

        isInitialized: true,
      });
    } catch (error) {
      console.log("INITIALIZE AUTH ERROR:", error);

      /*
       * Nếu token không còn hợp lệ,
       * xóa dữ liệu đăng nhập cũ.
       */
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

  /*
   * Load lại User Detail.
   *
   * Dùng sau khi:
   * - đổi avatar
   * - cập nhật profile
   * - thay đổi thông tin cá nhân
   */
  refreshUserDetail: async () => {
    try {
      /*
       * Không lấy user.userId ở đây.
       *
       * Vì sau khi app restart,
       * initializeAuth hiện chỉ restore
       * userDetail chứ chưa restore user.
       */
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

  /*
   * Đăng nhập
   */
  login: async (username, password) => {
    try {
      set({
        isLoading: true,
      });

      const response = await authService.login({
        username,

        password,

        provider: "web",

        device_token: "",
      });

      /*
       * HTTP 200 nhưng backend
       * result = false
       */
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

      /*
       * Lưu authentication
       */
      await SecureStore.setItemAsync("access_token", user.token);

      await SecureStore.setItemAsync("refresh_token", user.refreshToken);

      await SecureStore.setItemAsync("user_id", user.userId.toString());

      /*
       * Sau khi login,
       * tải User Detail.
       */
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
