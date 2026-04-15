"use client";

import { useState } from "react";
import { BookOpen, Loader2, School } from "lucide-react";

import { api } from "~/trpc/react";
import ClassCard from "~/components/classroom/class-card";
import CreateClassDialog from "~/components/classroom/create-class-dialog";
import JoinClassDialog from "~/components/classroom/join-class-dialog";

export default function ClassesPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: classes = [], isLoading, refetch } = api.classroom.allMine.useQuery();

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <School size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lớp học</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quản lý lớp học và bài kiểm tra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <JoinClassDialog onSuccess={() => void refetch()} />
          <CreateClassDialog onSuccess={() => void refetch()} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm text-gray-400">Đang tải lớp học...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <BookOpen size={36} className="text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Bạn chưa tham gia lớp nào
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              Tạo lớp học mới hoặc tham gia bằng mã mời từ giáo viên
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <JoinClassDialog onSuccess={() => void refetch()} />
            <CreateClassDialog onSuccess={() => void refetch()} />
          </div>
        </div>
      ) : (
        <>
          {copied && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
              ✅ Đã sao chép: <strong>{copied}</strong>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                classroom={cls}
                onCopyCode={handleCopyCode}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
