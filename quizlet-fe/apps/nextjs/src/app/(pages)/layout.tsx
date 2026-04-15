import type { ReactNode } from "react";

/**
 * Layout wrapper cho tất cả trang thông thường.
 * Thêm container + padding thay vì để root layout làm.
 */
export default function PagesLayout({ children }: { children: ReactNode }) {
  return <div className="container py-8">{children}</div>;
}
