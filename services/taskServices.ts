import { api } from "@/services/api";
import {
  CreateTaskCommentRequest,
  CreateTaskCommentResponse,
  TaskApiItem,
  TaskComment,
  TaskCommentResponse,
  TaskRequest,
  TaskResponse,
} from "@/types/Task";

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

  async createTaskComment(
    payload: CreateTaskCommentRequest,
  ): Promise<CreateTaskCommentResponse> {
    const formData = new FormData();
    formData.append("content", payload.content);
    formData.append("task_id", payload.task_id.toString());
    formData.append("receiver", payload.receiver.toString());

    payload.images?.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        name: image.fileName ?? `comment-${Date.now()}-${index}.jpg`,
        type: image.mimeType ?? "image/jpeg",
      } as any);
    });

    const res = await api.post<CreateTaskCommentResponse>(
      "/cskh/comment/register",
      formData,
      {
        headers: {
          "Content-Type": "Multipart/form-data",
        },
      },
    );

    console.log("check res comment", res);

    return res.data;
  },

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    const response = await api.get<TaskCommentResponse>("/cskh/comment", {
      params: {
        task_id: taskId,
      },
    });

    console.log("GET TASK COMMENTS:", response.data);

    if (!response.data.result) {
      throw new Error(response.data.message || "Không thể tải bình luận.");
    }

    return response.data.data ?? [];
  },
};
