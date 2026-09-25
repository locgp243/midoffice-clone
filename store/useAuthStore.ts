import { authService } from "@/services/authServices";
import { pushNotificationServices } from "@/services/pushNotificationServices";
import { UserProfile, userServices } from "@/services/userServices";
import { authUser } from "@/types/Auth";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

interface AuthState {
  user: authUser | null;
  userDetail: UserProfile | null;
  userId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initializeAuth: () => Promise<void>;
  refreshUserDetail: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const getStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};

const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const deleteStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

const clearAuthStorage = async () => {
  await Promise.allSettled([
    deleteStorageItem("access_token"),
    deleteStorageItem("refresh_token"),
    deleteStorageItem("user_id"),
  ]);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userDetail: null,
  userId: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initializeAuth: async () => {
    try {
      const token = await getStorageItem("access_token");
      const storedUserId = await getStorageItem("user_id");

      console.log("USER ID:", storedUserId);
      console.log("HAS TOKEN:", !!token);

      if (!token || !storedUserId) {
        set({
          user: null,
          userDetail: null,
          userId: null,
          isAuthenticated: false,
          isInitialized: true,
        });
        return;
      }

      const userId = Number(storedUserId);

      if (Number.isNaN(userId)) {
        throw new Error("User ID không hợp lệ.");
      }

      const userDetail = await userServices.getDetail(userId);

      set({
        userId,
        userDetail,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      console.log("INITIALIZE AUTH ERROR:", error);

      await clearAuthStorage();

      set({
        user: null,
        userDetail: null,
        userId: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  refreshUserDetail: async () => {
    try {
      let userId = get().userId;

      if (!userId) {
        const storedUserId = await getStorageItem("user_id");

        if (!storedUserId) {
          throw new Error("Không tìm thấy User ID.");
        }

        userId = Number(storedUserId);

        if (Number.isNaN(userId)) {
          throw new Error("User ID không hợp lệ.");
        }
      }

      const userDetail = await userServices.getDetail(userId);

      set({
        userId,
        userDetail,
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

      await setStorageItem("access_token", user.token);
      await setStorageItem("user_id", user.userId.toString());

      if (user.refreshToken) {
        await setStorageItem("refresh_token", user.refreshToken);
      } else {
        await deleteStorageItem("refresh_token");
      }

      const userDetail = await userServices.getDetail(user.userId);

      set({
        user,
        userDetail,
        userId: user.userId,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      throw error;
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  logout: async () => {
    await clearAuthStorage();

    set({
      user: null,
      userDetail: null,
      userId: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },
}));

// import { authService } from "@/services/authServices";
// import { UserProfile, userServices } from "@/services/userServices";
// import { authUser } from "@/types/Auth";
// import * as SecureStore from "expo-secure-store";
// import { Platform } from "react-native";
// import { create } from "zustand";

// interface AuthState {
//   user: authUser | null;
//   userDetail: UserProfile | null;
//   userId: number | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   isInitialized: boolean;
//   initializeAuth: () => Promise<void>;
//   refreshUserDetail: () => Promise<void>;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const getStorageItem = async (key: string) => {
//   if (Platform.OS === "web") {
//     return localStorage.getItem(key);
//   }

//   return SecureStore.getItemAsync(key);
// };

// const setStorageItem = async (key: string, value: string) => {
//   if (Platform.OS === "web") {
//     localStorage.setItem(key, value);
//     return;
//   }

//   await SecureStore.setItemAsync(key, value);
// };

// const deleteStorageItem = async (key: string) => {
//   if (Platform.OS === "web") {
//     localStorage.removeItem(key);
//     return;
//   }

//   await SecureStore.deleteItemAsync(key);
// };

// const clearAuthStorage = async () => {
//   await Promise.allSettled([
//     deleteStorageItem("access_token"),
//     deleteStorageItem("refresh_token"),
//     deleteStorageItem("user_id"),
//   ]);
// };

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   userDetail: null,
//   userId: null,
//   isAuthenticated: false,
//   isLoading: false,
//   isInitialized: false,

//   initializeAuth: async () => {
//     try {
//       const token = await getStorageItem("access_token");
//       const storedUserId = await getStorageItem("user_id");

//       console.log("USER ID:", storedUserId);
//       console.log("HAS TOKEN:", !!token);

//       if (!token || !storedUserId) {
//         set({
//           user: null,
//           userDetail: null,
//           userId: null,
//           isAuthenticated: false,
//           isInitialized: true,
//         });

//         return;
//       }

//       const userId = Number(storedUserId);

//       if (Number.isNaN(userId)) {
//         throw new Error("User ID không hợp lệ.");
//       }

//       const userDetail = await userServices.getDetail(userId);

//       set({
//         userId,
//         userDetail,
//         isAuthenticated: true,
//         isInitialized: true,
//       });
//     } catch (error) {
//       console.log("INITIALIZE AUTH ERROR:", error);

//       await clearAuthStorage();

//       set({
//         user: null,
//         userDetail: null,
//         userId: null,
//         isAuthenticated: false,
//         isInitialized: true,
//       });
//     }
//   },

//   refreshUserDetail: async () => {
//     try {
//       let userId = get().userId;

//       if (!userId) {
//         const storedUserId = await getStorageItem("user_id");

//         if (!storedUserId) {
//           throw new Error("Không tìm thấy User ID.");
//         }

//         userId = Number(storedUserId);

//         if (Number.isNaN(userId)) {
//           throw new Error("User ID không hợp lệ.");
//         }
//       }

//       const userDetail = await userServices.getDetail(userId);

//       set({
//         userId,
//         userDetail,
//       });
//     } catch (error) {
//       console.log("REFRESH USER DETAIL ERROR:", error);
//       throw error;
//     }
//   },

//   login: async (username, password) => {
//     try {
//       set({
//         isLoading: true,
//       });

//       const response = await authService.login({
//         username,
//         password,
//         provider: "web",
//         device_token: "",
//       });

//       if (!response.result) {
//         throw new Error(response.message || "Đăng nhập thất bại.");
//       }

//       const user = response.data?.[0];

//       if (!user) {
//         throw new Error("Không tìm thấy thông tin người dùng.");
//       }

//       if (!user.token) {
//         throw new Error("API không trả về access token.");
//       }

//       await setStorageItem("access_token", user.token);
//       await setStorageItem("user_id", user.userId.toString());

//       if (user.refreshToken) {
//         await setStorageItem("refresh_token", user.refreshToken);
//       } else {
//         await deleteStorageItem("refresh_token");
//       }

//       const userDetail = await userServices.getDetail(user.userId);

//       set({
//         user,
//         userDetail,
//         userId: user.userId,
//         isAuthenticated: true,
//         isInitialized: true,
//       });
//     } catch (error) {
//       console.log("LOGIN ERROR:", error);
//       throw error;
//     } finally {
//       set({
//         isLoading: false,
//       });
//     }
//   },

//   logout: async () => {
//     await clearAuthStorage();

//     set({
//       user: null,
//       userDetail: null,
//       userId: null,
//       isAuthenticated: false,
//       isInitialized: true,
//     });
//   },
// }));
