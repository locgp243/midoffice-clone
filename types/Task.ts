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

export type TaskRowsResponse = {
  result: boolean;
  message: string;
  status: number;
  totalPage: number;
  totalRecord: number;
  data: TaskApiItem[];
  options: Record<string, unknown>;
};

export type GetTaskRowsParams = {
  web?: "yes" | "no";
  offset?: number;
  limit?: number;
  creator?: number;
};
