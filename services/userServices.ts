import { api } from "@/services/api";

import { userDetail, userDetailResponse, userInfo } from "@/types/User";

export interface UserProfile extends userDetail {
  userInfo: userInfo;
}

export const userServices = {
  async getDetail(userId: number, token?: string): Promise<UserProfile> {
    const res = await api.get<userDetailResponse>(
      `cskh/users/detail/${userId}`,
      token
        ? {
            headers: {
              Authenrization: `Bearer ${token}`,
            },
          }
        : undefined,
    );

    const result = res.data;

    if (!result.result) {
      throw new Error(result.message || "Không thể tải thông tin user");
    }

    const user = result.data?.[0];

    if (!user) {
      throw new Error("Không tìm thấy thông tin user");
    }

    let userInfo: userInfo = {
      gmail: "",
      phone: "",
    };

    try {
      if (user.info) {
        userInfo = JSON.parse(user.info);
      }
    } catch (e: any) {
      console.log("lỗi: ", e);
      console.log("=== USER DETAIL ERROR ===");

      console.log("STATUS:", e?.response?.status);

      console.log("DATA:", e?.response?.data);

      console.log("BASE URL:", e?.config?.baseURL);

      console.log("PATH:", e?.config?.url);

      console.log("HAS AUTHORIZATION:", !!e?.config?.headers?.Authorization);
    }

    return {
      ...user,
      userInfo,
    };
  },
};
