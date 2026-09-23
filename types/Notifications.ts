export interface NotificationData {
  id: number;
  description: string;
  link: string;
  title: string;
  created_at: number;
  is_seen: number;
  keyword: string;
  level: string;
}

export interface NotificationResponse {
  result: boolean;
  message: string;
  status: number;
  totalPage: number;
  totalRecord: number;
  data: NotificationData[];
  options: {
    unseen_count: number;
  };
}

// tạm xử lý để gán bằng task vì hiện tại chưa có các type thể loại khác
export interface NotificationLink {
  task_name?: string;
  task_id?: number;
  type: string;
}
