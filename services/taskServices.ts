import { api } from "@/services/api";
import { TaskApiItem, TaskRequest, TaskResponse } from "@/types/Task";

export const taskServices = {
  async getTasks(params: TaskRequest) {
    const response = await api.get<TaskResponse>("/cskh/task/rows", {
      params: {
        web: params.web ?? "yes",
        offset: params.offset ?? 0,
        limit: params.limit ?? 20,
        creator: params.creator,
      },
    });

    return response.data;
  },

  async getDetail(
    taskId: number,
    creator?: number,
  ): Promise<TaskApiItem | null> {
    const response = await api.get<TaskResponse>("/cskh/task/rows", {
      params: {
        web: "yes",
        offset: 0,
        limit: 20,
        creator,
        task_id: taskId,
      },
    });

    console.log("Check servies: ", response.data);
    return response.data.data?.[0] ?? null;
  },
};
