/**
 * HTTP Client Utility
 * Xử lý request/response, authentication, error handling
 */

import { API_BASE_URL, ERROR_CODE, HTTP_METHOD } from "./config";

// Token storage key
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

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
 * Lấy access token từ storage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Lưu tokens vào storage
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Xóa tokens
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Lấy refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Xây dựng headers với Authorization
 */
function getHeaders(
  init?: ApiRequestInit
): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();

  // Nếu body là FormData, không set Content-Type (browser sẽ set boundary)
  if (!(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Thêm Authorization token nếu có
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Merge với headers từ init
  if (init?.headers) {
    Object.assign(headers, init.headers);
  }

  return headers;
}

/**
 * Làm mới access token bằng refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      setTokens(data.accessToken);
      return data.accessToken;
    }

    clearTokens();
    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    clearTokens();
    return null;
  }
}

/**
 * Generic HTTP request function
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestInit & { method?: HTTP_METHOD } = {}
): Promise<ApiResponse<T>> {
  const method = options.method || HTTP_METHOD.GET;
  const headers = getHeaders(options);

  // Prepare body
  let body: string | FormData | undefined;
  if (options.body) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      body = JSON.stringify(options.body);
    }
  }

  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  try {
    let response = await fetch(fullUrl, {
      ...options,
      method,
      headers,
      body,
    });

    // Handle 401 - Try refresh token
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const newHeaders = getHeaders(options);
        response = await fetch(fullUrl, {
          ...options,
          method,
          headers: newHeaders,
          body,
        });
      } else {
        return {
          success: false,
          error: {
            code: ERROR_CODE.UNAUTHORIZED,
            message: "Unauthorized - Please login again",
          },
          status: 401,
        };
      }
    }

    const contentType = response.headers.get("content-type");
    let data: T | undefined;

    // Handle binary response (e.g., file download)
    if (
      contentType?.includes("application/vnd.openxmlformats") ||
      contentType?.includes("audio/") ||
      contentType?.includes("image/")
    ) {
      data = (await response.blob()) as unknown as T;
    } else if (contentType?.includes("application/json")) {
      data = await response.json();
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
              message: response.statusText || "Request failed",
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

/**
 * GET request
 */
export async function apiGet<T = any>(
  url: string,
  options?: Omit<ApiRequestInit, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.GET });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  url: string,
  body?: Record<string, any> | FormData,
  options?: Omit<ApiRequestInit, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: HTTP_METHOD.POST,
    body,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  url: string,
  body?: Record<string, any>,
  options?: Omit<ApiRequestInit, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: HTTP_METHOD.PUT,
    body,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  options?: Omit<ApiRequestInit, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: HTTP_METHOD.DELETE });
}

/**
 * PATCH request
 */
export async function apiPatch<T = any>(
  url: string,
  body?: Record<string, any>,
  options?: Omit<ApiRequestInit, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: HTTP_METHOD.PATCH,
    body,
  });
}

