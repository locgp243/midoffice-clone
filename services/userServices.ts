import { api } from "@/services/api";

import { changePasswordRequest, changePasswordResponse } from "@/types/Auth";
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
    }

    return {
      ...user,
      userInfo,
    };
  },

  async changePassword(
    data: changePasswordRequest,
    token?: string,
  ): Promise<changePasswordResponse> {
    const res = await api.patch<changePasswordResponse>(
      "/cskh/users/change-password",
      data,
      token
        ? {
            headers: {
              Authenrization: `Bearer: ${token}`,
            },
          }
        : undefined,
    );

    return res.data;
  },
};
