import type { ApiResponse, ApiErrorResponse } from "../types/index.js";
import { AppError, ErrorCode } from "../errors/index.js";

export interface ApiClient {
  get<T>(path: string): Promise<ApiResponse<T>>;
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  delete<T>(path: string): Promise<ApiResponse<T>>;
}

/**
 * Create a typed API client bound to the given base URL.
 * All requests include credentials (httpOnly session cookies).
 */
export function createApiClient(baseUrl: string): ApiClient {
  async function request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const hasBody = body !== undefined;
    const headers: Record<string, string> = {};
    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }

    const init: RequestInit = {
      method,
      credentials: "include",
      headers,
    };
    if (hasBody) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${path}`, init);

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => ({}));
      const isApiErrorResponse =
        typeof errorBody === "object" &&
        errorBody !== null &&
        "error" in errorBody &&
        typeof (errorBody as Record<string, unknown>)["error"] === "object" &&
        (errorBody as Record<string, unknown>)["error"] !== null;

      if (isApiErrorResponse) {
        throw parseApiError(errorBody as ApiErrorResponse);
      }

      throw new AppError(ErrorCode.INTERNAL_ERROR, `HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    return data as ApiResponse<T>;
  }

  return {
    get<T>(path: string): Promise<ApiResponse<T>> {
      return request<T>("GET", path);
    },
    post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
      return request<T>("POST", path, body);
    },
    put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
      return request<T>("PUT", path, body);
    },
    delete<T>(path: string): Promise<ApiResponse<T>> {
      return request<T>("DELETE", path);
    },
  };
}

/**
 * Parse API error response into AppError.
 * Can be used by real implementations.
 */
export function parseApiError(response: ApiErrorResponse): AppError {
  const { code, message, field, details } = response.error;
  const errorCode = Object.values(ErrorCode).includes(code as typeof ErrorCode[keyof typeof ErrorCode])
    ? (code as typeof ErrorCode[keyof typeof ErrorCode])
    : ErrorCode.INTERNAL_ERROR;
  const options: {
    field?: string;
    details?: Record<string, unknown>;
  } = {};

  if (field !== undefined) {
    options.field = field;
  }
  if (details !== undefined) {
    options.details = details;
  }

  return new AppError(errorCode, message, options);
}
