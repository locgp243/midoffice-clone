export interface authRequest {
  username: string;
  password: string;
  provider: string;
  device_token: string;
}

export interface authUser {
  userId: number;
  clientId: string;
  role: number;
  avatar: string | null;
  department_id: number;
  username: string;
  name: string;
  roleName: string;
  token: string;
  refreshToken: string;
}

export interface authResponse {
  result: boolean;
  message: string;
  status: number;
  data: authUser[];
  option: object | null;
}

export interface changePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface changePasswordResponse {
  result: boolean;
  message: string;
  status: number;
  data: unknown[] | null;
  options: Object | null;
}
