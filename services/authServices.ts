import { api } from "@/services/api";
import { authRequest, authResponse } from "@/types/Auth";

export const authService = {
  async login(data: authRequest): Promise<authResponse> {
    const res = await api.post<authResponse>("/cskh/users/login", data);
    return res.data;
  },
};
