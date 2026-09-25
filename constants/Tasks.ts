export type TopTab = "mine" | "created" | "customerRequest" | "staff";

export type TaskFilter =
  | "all"
  | "pending"
  | "processing"
  | "overdue"
  | "waitingApproval"
  | "completed";

export const TASK_STATUS = {
  PENDING: 2,
  COMPLETED: 3,
} as const;

export const STATUS_MAP: Record<
  Exclude<TaskFilter, "all" | "overdue">,
  number[]
> = {
  pending: [TASK_STATUS.PENDING],
  processing: [],
  waitingApproval: [],
  completed: [TASK_STATUS.COMPLETED],
};

export const topTabs: TopTab[] = [
  "mine",
  "created",
  "customerRequest",
  "staff",
];

export const filters: TaskFilter[] = [
  "all",
  "pending",
  "processing",
  "overdue",
  "waitingApproval",
  "completed",
];

export const floatingActions = [
  {
    id: "office",
    label: "officeTask",
    icon: "create-outline" as const,
  },
  {
    id: "outside",
    label: "outsideTask",
    icon: "arrow-redo-circle-outline" as const,
  },
  {
    id: "department",
    label: "departmentRequest",
    icon: "chatbox-ellipses-outline" as const,
  },
  {
    id: "support",
    label: "customerSupportRequest",
    icon: "git-compare-outline" as const,
  },
];
