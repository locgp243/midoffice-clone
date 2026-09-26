import { api } from "@/services/api";
import {
  CreateTaskCommentRequest,
  CreateTaskCommentResponse,
  DeleteTaskCommentResponse,
  TaskApiItem,
  TaskComment,
  TaskCommentResponse,
  TaskRequest,
  TaskResponse,
  UpdateTaskCommentRequest,
  UpdateTaskCommentResponse,
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

  async updateTaskComment(
    payload: UpdateTaskCommentRequest,
  ): Promise<UpdateTaskCommentResponse> {
    const formData = new FormData();

    formData.append("content", payload.content);

    formData.append("existingImages", JSON.stringify(payload.existingImages));

    payload.images?.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        name: image.fileName ?? `comment-${Date.now()}-${index}.jpg`,
        type: image.mimeType ?? "image/jpeg",
      } as any);
    });

    const res = await api.put<UpdateTaskCommentResponse>(
      `/cskh/comment/update/${payload.commentId}`,
      formData,
    );

    console.log("check updatacomment value:", res.data);

    return res.data;
  },

  async deleteComment(commentId: number): Promise<DeleteTaskCommentResponse> {
    const res = await api.delete<DeleteTaskCommentResponse>(
      `/cskh/comment/delete/${commentId}`,
    );

    console.log("check res: ", res);

    return res.data;
  },
};
