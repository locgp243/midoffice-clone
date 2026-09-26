import type { ImagePickerAsset } from "expo-image-picker";

export type TaskApiItem = {
  info_customer: unknown | null;
  creator: number;
  agency_name: string | null;
  browse: number;
  area_id: number;
  retask: number;
  location: string | null;
  start_time_location: number | null;
  task_id: number;
  type_task_id: number;
  name: string;
  note: string | null;
  number_again: number;
  priority: number;
  fix_location: unknown | null;
  created_at: number;
  updated_at: number | null;
  receiver: number;
  status: number;
  expired_on: number | null;
  time_waiting: number | null;
  expired_on_extra: number | null;
  task_receiver_id: number;
  type_task_name: string;
  priority_name: string;
  username: string;
  creator_name: string;
  receiver_updated_at: number | null;
  star: number | null;
};

export type TaskResponse = {
  result: boolean;
  message: string;
  status: number;
  totalPage: number;
  totalRecord: number;
  data: TaskApiItem[];
  options: Record<string, unknown>;
};

export type TaskRequest = {
  web?: "yes" | "no";
  offset?: number;
  limit?: number;
  creator?: number;
};

export interface CreateTaskCommentRequest {
  content: string;
  task_id: number;
  receiver: number;
  images?: ImagePickerAsset[];
}

export interface CreateTaskCommentResponse {
  result: boolean;
  message: string;
  status: number;
  data: {
    content: string;
    user_id: number;
    task_id: number;
    receiver: number;
    created_at: number;
    url_img: string;
    id: number;
  };
  options: object;
}

export interface TaskComment {
  id: number;
  content: string;
  parent_id: number | null;
  url_img: string;
  task_id: number;
  receiver: number;
  created_at: number;
  user_id: number;
  sender_name: string;
  sender_avatar: string | null;
}

export interface TaskCommentResponse {
  result: boolean;
  message: string;
  status: number;
  totalPage: number;
  totalRecord: number;
  data: TaskComment[];
  options: object;
}

export interface UpdateTaskCommentRequest {
  commentId: number;
  content: string;
  existingImages: string[];
  images: ImagePickerAsset[];
}

export interface UpdateTaskCommentResponse {
  result: boolean;
  message: string;
  status: number;
  data: object;
  options: object;
}

export interface DeleteTaskCommentResponse {
  result: boolean;
  message: string;
  status: number;
  data: object;
  options: object;
}
