/**
 * HTTP Client Utility
 * Xử lý request/response, authentication, error handling.
 *
 * Token được lưu trong httpOnly cookie bởi Next.js route handler (/api/auth/login).
 * Browser tự gửi cookie theo mỗi request nếu dùng credentials: 'include'.
 * Client-side KHÔNG cần đọc/ghi token thủ công từ localStorage.
 */

import { API_BASE_URL, ERROR_CODE, HTTP_METHOD } from "./config";

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  body?: Record<string, any> | FormData;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
  status: number;
}

/**
 * Generic HTTP request function.
 * Dùng credentials: 'include' để browser tự gửi httpOnly cookie access_token.
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestInit & { method?: HTTP_METHOD } = {}
): Promise<ApiResponse<T>> {
  const method = options.method ?? HTTP_METHOD.GET;

  // Build headers
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Prepare body
  let body: string | FormData | undefined;
  if (options.body) {
    body =
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body);
  }

  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      method,
      headers,
      body,
      credentials: "include", // Gửi httpOnly cookie access_token tự động
    });

    // 401 → redirect về home, AuthContext sẽ xử lý logout
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      return {
        success: false,
        error: { code: ERROR_CODE.UNAUTHORIZED, message: "Unauthorized" },
        status: 401,
      };
    }

    const contentType = response.headers.get("content-type");
    let data: T | undefined;

    if (
      contentType?.includes("application/vnd.openxmlformats") ||
      contentType?.includes("audio/") ||
      contentType?.includes("image/")
    ) {
      data = (await response.blob()) as unknown as T;
    } else if (contentType?.includes("application/json")) {
      data = (await response.json()) as T;
    } else {
      data = (await response.text()) as unknown as T;
    }

    return {
      success: response.ok,
      data,
      status: response.status,
      ...(response.ok
        ? {}
        : {
            error: {
              code: response.status,
              message:
                (data as any)?.message ??
                response.statusText ??
                "Request failed",
            },
          }),
    };
  } catch (error) {
    console.error("API request error:", error);
    return {
      success: false,
      error: {
        code: ERROR_CODE.NETWORK_ERROR,
        message: error instanceof Error ? error.message : "Network error",
      },
      status: 0,
    };
  }
}

/** GET request */
export async function apiGet<T = any>(
  url: string,
  options?: Omit<ApiRequestInit, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.GET });
}

/** POST request */
export async function apiPost<T = any>(
  url: string,
  body?: Record<string, any> | FormData,
  options?: Omit<ApiRequestInit, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.POST, body });
}

/** PUT request */
export async function apiPut<T = any>(
  url: string,
  body?: Record<string, any>,
  options?: Omit<ApiRequestInit, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.PUT, body });
}

/** DELETE request */
export async function apiDelete<T = any>(
  url: string,
  options?: Omit<ApiRequestInit, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.DELETE });
}

/** PATCH request */
export async function apiPatch<T = any>(
  url: string,
  body?: Record<string, any>,
  options?: Omit<ApiRequestInit, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.PATCH, body });
}
