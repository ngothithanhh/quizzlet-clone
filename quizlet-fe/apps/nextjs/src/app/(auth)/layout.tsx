import type { ReactNode } from "react";

/**
 * Layout cho các trang auth full-screen (forgot-password, v.v.)
 * Không có container/padding wrapper để trang chiếm toàn viewport.
 * Root layout đã có Navbar, nên không cần thêm ở đây.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
