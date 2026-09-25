import { api } from "@/services/api";
import { ReportData, ReportResponse } from "@/types/Reports";

export const reportServices = {
  async getStatistic(userId: number): Promise<ReportData> {
    const response = await api.get<ReportResponse>("/cskh/report/statistic", {
      params: {
        user_id: userId,
      },
    });

    console.log("Check data response services report:", response.data.data);

    if (!response.data.result) {
      throw new Error(response.data.message || "Không thể tải thống kê.");
    }

    return response.data.data;
  },
};
