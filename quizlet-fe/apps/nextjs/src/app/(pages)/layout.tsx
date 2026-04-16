import type { ReactNode } from "react";

/**
 * Layout wrapper cho tất cả trang thông thường.
 * Thêm container + padding thay vì để root layout làm.
 */
export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-blue-50/60 dark:bg-[#07132E] relative overflow-hidden flex flex-col flex-1">
      {/* Global decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 -top-20 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e50a_1px,transparent_1px),linear-gradient(to_bottom,#4f46e50a_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      
      {/* Main Container */}
      <div className="container py-8 mx-auto relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
}
