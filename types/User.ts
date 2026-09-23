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

export interface UploadAvatarResponse {
  result: Boolean;
  message: String;
  status: number;
  data: [
    {
      fieldCount: number;
      affectedRows: number;
      insetedId: number;
      info: String;
      serverStatus: number;
      warningStatus: number;
      changedRows: number;
    },
  ];
  options: object;
}

export interface userUpdateRequest {
  department_id: number;
  info: String;
  name: String;
  parent_id: number;
  username: String;
}

export interface userUpdateResponse {
  result: boolean;
  message: string;
  status: number;

  data: {
    so_phep_nam: number;
    starting_date: string;
    name_bank: string;
    stk: string;
    cccd: string;
    info: string;
    department_id: number;
    parent_id: number;
    name: string;
    username: string;
    updated_at: number;
    birthday: string;
    id: string;
  };

  options: object;
}
