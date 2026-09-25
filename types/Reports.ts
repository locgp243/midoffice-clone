export interface ReportData {
  total: number;
  completed: number;
  late_completed: number;
  delayed: number;
}

export interface ReportResponse {
  result: boolean;
  message: string;
  status: number;
  totalPage: number;
  totalRecord: number;
  data: ReportData;
  options: object;
}
