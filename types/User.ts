export interface userDetail {
  id: number;
  name: string;
  username: string;
  is_actived: number;
  created_at: number | null;
  updated_at: number | null;
  remaining_days_off: number;
  avatar: null | string;
  parent_id: number;
  department_id: number;
  info: string;
  department_name: string;
  department_head: string;
}

export interface userDetailResponse {
  result: boolean;
  message: string;
  status: number;
  totalPage: number;
  totalRecord: number;
  data: userDetail[];
  options: object;
}

export interface userInfo {
  gmail: string;
  phone: string;
}
