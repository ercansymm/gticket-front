// ========== GENEL API RESPONSE ==========

export interface ApiResponse<T = unknown> {
  hasError: boolean;
  errorMessage: string | null;
  data?: T;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
