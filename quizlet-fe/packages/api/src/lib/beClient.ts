/**
 * Server-side BE API client dùng trong tRPC routers.
 * Tự động gắn Bearer token từ session hoặc Authorization header.
 */

import { TRPCError } from "@trpc/server";

const BE_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface BeFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  /** JWT accessToken từ BE (lưu trong session/localStorage). */
  token?: string | null;
}

async function beFetch<T>(
  path: string,
  { method = "GET", body, token }: BeFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BE_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null
        ? (data as any).message ?? res.statusText
        : res.statusText;

    throw new TRPCError({
      code:
        res.status === 404
          ? "NOT_FOUND"
          : res.status === 401
            ? "UNAUTHORIZED"
            : res.status === 403
              ? "FORBIDDEN"
              : "INTERNAL_SERVER_ERROR",
      message,
    });
  }

  return data as T;
}

export const beGet = <T>(path: string, token?: string | null) =>
  beFetch<T>(path, { method: "GET", token });

export const bePost = <T>(path: string, body?: unknown, token?: string | null) =>
  beFetch<T>(path, { method: "POST", body, token });

export const bePut = <T>(path: string, body?: unknown, token?: string | null) =>
  beFetch<T>(path, { method: "PUT", body, token });

export const beDelete = <T>(path: string, token?: string | null) =>
  beFetch<T>(path, { method: "DELETE", token });
