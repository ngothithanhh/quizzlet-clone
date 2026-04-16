"use client";

import Link from "next/link";
import { BookMarked, ChevronRight, Loader2, Plus, Search, Trash2, User, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { useState } from "react";

interface StudySetsTabProps {
  classId: number;
  isCreator: boolean;
  isTeacher?: boolean;  // Creator OR Teacher
}

const PASTEL_GRADIENTS = [
  "from-indigo-50 to-purple-50 border-indigo-100",
  "from-violet-50 to-pink-50 border-violet-100",
  "from-blue-50 to-cyan-50 border-blue-100",
  "from-emerald-50 to-teal-50 border-emerald-100",
  "from-orange-50 to-rose-50 border-orange-100",
];

const PASTEL_GRADIENTS_DARK = [
  "dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800/50",
  "dark:from-violet-900/20 dark:to-pink-900/20 dark:border-violet-800/50",
  "dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800/50",
  "dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800/50",
  "dark:from-orange-900/20 dark:to-rose-900/20 dark:border-orange-800/50",
];

export default function StudySetsTab({ classId, isCreator, isTeacher = false }: StudySetsTabProps) {
  const canManage = isCreator || isTeacher;
  const { data: studySets = [], isLoading } = api.classroom.studySets.useQuery({ classId });
  const utils = api.useUtils();

  const removeMutation = api.classroom.removeStudySet.useMutation({
    onSuccess: () => {
      void utils.classroom.studySets.invalidate({ classId });
      toast.success("Đã gỡ học phần khỏi lớp");
    },
    onError: (err) => toast.error(err.message ?? "Lỗi khi gỡ học phần"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <BookMarked size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Học phần trong lớp</h2>
            <p className="text-xs text-gray-400">{studySets.length} học phần</p>
          </div>
        </div>
        {canManage && (
          <AddStudySetDialog classId={classId} currentStudySets={studySets} />
        )}
      </div>

      {studySets.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
            <BookMarked size={32} className="text-indigo-300 dark:text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">Chưa có học phần nào</p>
            {canManage ? (
              <p className="text-sm text-gray-400 mt-1">
                Thêm học phần để học sinh ôn tập trong lớp
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                Giáo viên chưa thêm học phần nào vào lớp này
              </p>
            )}
          </div>
          {canManage && (
            <AddStudySetDialog classId={classId} currentStudySets={studySets} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studySets.map((set, i) => {
            const idx = i % PASTEL_GRADIENTS.length;
            const pastel = PASTEL_GRADIENTS[idx];
            const pastelDark = PASTEL_GRADIENTS_DARK[idx];
            const isPending = removeMutation.isPending && (removeMutation.variables as any)?.studySetId === set.id;

            return (
              <div
                key={set.id}
                className={`group relative flex flex-col p-4 rounded-2xl border bg-gradient-to-br ${pastel} ${pastelDark} hover:shadow-md transition-all`}
              >
                {/* Delete button — teacher or creator */}
                {canManage && (
                  <button
                    onClick={() => removeMutation.mutate({ classId, studySetId: set.id })}
                    disabled={isPending}
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-900/80 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                    title="Gỡ khỏi lớp"
                  >
                    {isPending
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />}
                  </button>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white dark:border-gray-700 flex items-center justify-center shadow-sm">
                    <BookMarked size={18} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">
                      {set.title}
                    </h3>
                    {set.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {set.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/50 dark:border-gray-700/50">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User size={10} />
                    {set.createdBy ?? "—"}
                  </span>
                  <Link
                    href={`/study-sets/${set.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                  >
                    Học ngay <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Add Study Set Dialog ─────────────────────────────────────────────────────

function AddStudySetDialog({
  classId,
  currentStudySets,
}: {
  classId: number;
  currentStudySets: any[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"mine" | "search">("mine");

  const { data: mySets = [], isLoading: loadingMine } = api.studySet.allMine.useQuery(
    undefined,
    { enabled: open },
  );
  const { data: searchResults = [], isFetching } = api.studySet.search.useQuery(
    { keyword: query },
    { enabled: tab === "search" && query.trim().length > 1 },
  );

  const utils = api.useUtils();
  const addMutation = api.classroom.addStudySet.useMutation({
    onSuccess: () => {
      void utils.classroom.studySets.invalidate({ classId });
      toast.success("Đã thêm học phần vào lớp!");
    },
    onError: (err) => toast.error(err.message ?? "Có lỗi xảy ra"),
  });

  const displayed = tab === "mine"
    ? mySets.filter((s) =>
        !query.trim() ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : searchResults;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setQuery(""); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9 text-sm shadow-md shadow-indigo-200 dark:shadow-none rounded-xl">
          <Plus size={15} /> Thêm học phần
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <BookMarked size={20} className="text-indigo-600" />
            </div>
            <div>
              <DialogTitle>Thêm học phần vào lớp</DialogTitle>
              <DialogDescription>Chọn học phần để học sinh ôn tập</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
          {(["mine", "search"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setQuery(""); }}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                tab === t
                  ? "bg-white dark:bg-gray-900 shadow text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t === "mine" ? "Học phần của tôi" : "🌐 Tìm công khai"}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 mb-2">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "mine" ? "Lọc học phần của bạn..." : "Tìm theo tên hoặc mô tả..."}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
          />
          {(loadingMine || isFetching) && <Loader2 size={13} className="animate-spin text-gray-400 flex-shrink-0" />}
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[300px] overflow-y-auto space-y-1.5">
          {tab === "search" && query.trim().length < 2 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              Nhập ít nhất 2 ký tự để tìm kiếm học phần công khai
            </p>
          ) : displayed.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              {loadingMine ? "Đang tải..." : "Không có học phần nào"}
            </p>
          ) : (
            displayed.map((set) => {
              const isAdded = currentStudySets.some((s) => s.id === set.id);
              const isPending = addMutation.isPending && addMutation.variables?.studySetId === set.id;

              return (
                <div
                  key={set.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                    <BookMarked size={15} className="text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {set.title}
                    </p>
                    {set.description && (
                      <p className="text-[11px] text-gray-400 truncate">{set.description}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {set.isPublic ? "🌐 Công khai" : "🔒 Riêng tư"}
                      {set.user?.name && ` · ${set.user.name}`}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAdded || isPending}
                    onClick={() => addMutation.mutate({ classId, studySetId: set.id })}
                    className={`h-7 text-xs flex-shrink-0 rounded-lg ${
                      isAdded
                        ? "text-green-600 border-green-200 bg-green-50 dark:bg-transparent cursor-default"
                        : "hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : isAdded ? (
                      "✓ Đã thêm"
                    ) : (
                      "Thêm"
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

