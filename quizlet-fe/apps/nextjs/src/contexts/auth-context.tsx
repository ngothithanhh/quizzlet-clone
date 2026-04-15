"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string;
  name?: string;
  image?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /**
   * Fetch wrapper tự động refresh access_token khi gặp 401.
   * Dùng thay cho fetch() thông thường trong toàn bộ app.
   */
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Ngăn nhiều request cùng lúc đều trigger refresh
  const isRefreshing = useRef(false);
  // Queue các request đang chờ refresh hoàn thành
  const pendingQueue = useRef<Array<(ok: boolean) => void>>([]);

  const flushQueue = (ok: boolean) => {
    pendingQueue.current.forEach((resolve) => resolve(ok));
    pendingQueue.current = [];
  };

  // ─── Lấy user hiện tại từ cookie ─────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");

      if (res.status === 401) {
        // Token hết hạn — thử refresh trước khi logout
        const refreshRes = await fetch("/api/auth/refresh-token", { method: "POST" });

        if (refreshRes.ok) {
          // Refresh thành công — thử lại lấy user
          const retryRes = await fetch("/api/auth/me");
          if (retryRes.ok) {
            const data = await retryRes.json();
            setUser(data.user ?? null);
            setAccessToken(data.accessToken ?? null);
            return;
          }
        }

        // Refresh cũng fail → clear session
        setUser(null);
        setAccessToken(null);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
        setAccessToken(data.accessToken ?? null);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ─── Tự động refresh token khi 401 ───────────────────────────────────────
  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing.current) {
      // Đợi refresh đang chạy
      return new Promise<boolean>((resolve) => {
        pendingQueue.current.push(resolve);
      });
    }

    isRefreshing.current = true;
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      const ok = res.ok;
      if (ok) {
        // Cập nhật lại user/token state
        await refresh();
      } else {
        // Refresh token hết hạn → đăng xuất
        setUser(null);
        setAccessToken(null);
      }
      flushQueue(ok);
      return ok;
    } catch {
      flushQueue(false);
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [refresh]);

  /**
   * fetchWithAuth — tự động gắn cookies và retry khi 401.
   * Cookie access_token được gắn tự động qua httpOnly, không cần set Authorization header thủ công.
   */
  const fetchWithAuth = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Lần 1: gửi request bình thường
      let res = await fetch(input, {
        ...init,
        credentials: "include", // gửi kèm cookie
      });

      if (res.status === 401) {
        // Thử refresh
        const refreshed = await tryRefreshToken();

        if (refreshed) {
          // Retry request gốc sau khi có token mới
          res = await fetch(input, {
            ...init,
            credentials: "include",
          });
        } else {
          // Refresh thất bại → chuyển về trang chủ
          router.push("/");
        }
      }

      return res;
    },
    [tryRefreshToken, router],
  );

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data.error ?? "Login failed" };
        }

        setUser(data.user);
        await refresh();
        router.refresh();
        return {};
      } catch {
        return { error: "Network error" };
      }
    },
    [refresh, router],
  );

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAccessToken(null);
    router.refresh();
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        refresh,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
