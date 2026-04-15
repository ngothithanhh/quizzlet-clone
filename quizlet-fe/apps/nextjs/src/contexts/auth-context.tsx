"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      } catch (err) {
        return { error: "Network error" };
      }
    },
    [refresh, router],
  );

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
