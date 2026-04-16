"use client";

import { useState } from "react";
import { BookOpen, Hash, Loader2, Plus, School, Users } from "lucide-react";

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

  const myClasses = classes.filter((c) => c.isCreator);
  const joinedClasses = classes.filter((c) => !c.isCreator);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container max-w-6xl py-10">

        {/* ─── Hero Header ────────────────────────────────────────── */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl -z-10" />
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-3xl border border-white dark:border-gray-800 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-300/40 dark:shadow-indigo-900/40">
                <School size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Lớp học
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                  {classes.length > 0
                    ? `${classes.length} lớp • ${myClasses.length} đang dạy • ${joinedClasses.length} đang học`
                    : "Tham gia hoặc tạo lớp học mới"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <JoinClassDialog onSuccess={() => void refetch()} />
              <CreateClassDialog onSuccess={() => void refetch()} />
            </div>
          </div>
        </div>

        {/* ─── Loading ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
            </div>
            <p className="text-gray-400 text-sm">Đang tải danh sách lớp...</p>
          </div>

        ) : classes.length === 0 ? (
          /* ─── Empty ─────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-xl">
              <BookOpen size={40} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Chưa có lớp học nào</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-sm">
                Tạo lớp học để chia sẻ bài giảng với học sinh,
                hoặc tham gia bằng mã mời từ giáo viên.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <JoinClassDialog onSuccess={() => void refetch()} />
              <CreateClassDialog onSuccess={() => void refetch()} />
            </div>

            {/* Quick guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-md w-full">
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-left">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Plus size={16} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tạo lớp mới</p>
                  <p className="text-xs text-gray-400 mt-0.5">Dành cho giáo viên, tự động sinh mã mời</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-left">
                <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Hash size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tham gia lớp</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nhập mã mời từ giáo viên để vào lớp</p>
                </div>
              </div>
            </div>
          </div>

        ) : (
          <>
            {/* ─── Classes I teach ─────────────────────────────────── */}
            {myClasses.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <School size={16} className="text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Lớp tôi dạy
                  </h2>
                  <span className="ml-1 text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    {myClasses.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myClasses.map((cls) => (
                    <ClassCard key={cls.id} classroom={cls} onCopyCode={handleCopyCode} />
                  ))}
                </div>
              </section>
            )}

            {/* ─── Classes I joined ────────────────────────────────── */}
            {joinedClasses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users size={16} className="text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Lớp tôi học
                  </h2>
                  <span className="ml-1 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    {joinedClasses.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {joinedClasses.map((cls) => (
                    <ClassCard key={cls.id} classroom={cls} onCopyCode={handleCopyCode} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Toast notification for copy */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-2xl shadow-2xl">
          <span className="text-green-400">✓</span>
          Đã sao chép: <strong className="font-mono tracking-widest">{copied}</strong>
        </div>
      )}
    </div>
  );
}
