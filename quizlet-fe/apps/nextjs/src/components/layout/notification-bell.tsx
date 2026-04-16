"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellDot, Check, CheckCheck, Loader2, X } from "lucide-react";

import { api } from "~/trpc/react";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Polling unread count mỗi 30s
  const { data: unreadCount = 0, refetch: refetchCount } = api.notification.unreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 },
  );

  const { data: notifications = [], isLoading, refetch: refetchAll } = api.notification.all.useQuery(
    undefined,
    { enabled: isOpen }, // chỉ fetch khi dropdown mở
  );

  const markRead = api.notification.markRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchAll();
    },
  });

  const markAllRead = api.notification.markAllRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchAll();
    },
  });

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setIsOpen((v) => !v);
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Thông báo"
      >
        {unreadCount > 0 ? (
          <BellDot size={20} className="text-indigo-600" />
        ) : (
          <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  {markAllRead.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    !n.isRead ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                  }`}
                >
                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    </div>
                  )}

                  {/* Content */}
                  <div className={`flex-1 min-w-0 ${n.isRead ? "pl-4" : ""}`}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => { handleMarkRead(n.id); setIsOpen(false); }}
                        className="block"
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1 inline-block">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  {/* Mark read button — always visible for unread */}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      disabled={markRead.isPending}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all text-indigo-400 hover:text-indigo-600"
                      title="Đánh dấu đã đọc"
                    >
                      {markRead.isPending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 text-center">
              <span className="text-xs text-gray-400">
                {notifications.length} thông báo gần đây
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
