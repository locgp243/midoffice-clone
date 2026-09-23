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

  async uploadAvatar(userId: number, imageUri: string) {
    const formData = new FormData();

    const fileName = imageUri.split("/").pop() || `avatar-${Date.now()}.jpg`;

    const extension = fileName.split(".").pop()?.toLowerCase();

    let mimeType = "image/jpeg";

    if (extension === "png") {
      mimeType = "image/png";
    } else if (extension === "webp") {
      mimeType = "image/webp";
    } else if (extension === "heic" || extension === "heif") {
      mimeType = "image/heic";
    }

    console.log("UPLOAD USER ID:", userId);

    console.log("UPLOAD URI:", imageUri);

    console.log("UPLOAD FILE NAME:", fileName);

    console.log("UPLOAD MIME:", mimeType);

    formData.append("avatar", {
      uri: imageUri,

      name: fileName,

      type: mimeType,
    } as any);

    try {
      const response = await api.patch(
        `/cskh/users/upload-avatar/${userId}`,
        formData,
      );

      console.log("UPLOAD AVATAR SUCCESS:", response.data);

      return response.data;
    } catch (error: any) {
      console.log("UPLOAD AVATAR STATUS:", error?.response?.status);

      console.log(
        "UPLOAD AVATAR ERROR DATA:",
        JSON.stringify(error?.response?.data, null, 2),
      );

      console.log("UPLOAD AVATAR MESSAGE:", error?.message);

      throw error;
    }
  },
};
