import { STATUS_MAP } from "@/constants/Tasks";
import { TaskApiItem } from "@/types/Task";

export const isTaskOverdue = (task: TaskApiItem) => {
  if (!task.expired_on) return false;
  if (STATUS_MAP.completed.includes(task.status)) return false;

  return task.expired_on < Date.now();
};

export const getTaskStatusLabel = (status: number) => {
  if (STATUS_MAP.pending.includes(status)) return "Đang chờ";
  if (STATUS_MAP.processing.includes(status)) return "Đang xử lý";
  if (STATUS_MAP.waitingApproval.includes(status)) return "Chờ duyệt";
  if (STATUS_MAP.completed.includes(status)) return "Hoàn thành";

  return `Status ${status}`;
};
