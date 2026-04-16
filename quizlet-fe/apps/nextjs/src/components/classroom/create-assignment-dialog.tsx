"use client";

import { useState } from "react";
import { BookMarked, Calendar, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface CreateAssignmentDialogProps {
  classId: number;
}

export default function CreateAssignmentDialog({ classId }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSet, setSelectedSet] = useState<{ id: number; title: string } | null>(null);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const utils = api.useUtils();

  // Tìm kiếm studyset theo tên / mô tả
  const { data: searchResults = [], isFetching } = api.studySet.search.useQuery(
    { keyword: query },
    { enabled: query.trim().length > 1 },
  );

  // Studysets của mình (luôn hiện)
  const { data: mySets = [], isLoading: loadingMine } = api.studySet.allMine.useQuery(
    undefined,
    { enabled: showSearch },
  );

  const filtered = query.trim().length > 1 ? searchResults : mySets;

  const { mutate, isPending } = api.classroom.createAssignment.useMutation({
    onSuccess: () => {
      void utils.classroom.assignments.invalidate({ classId });
      setOpen(false);
      reset();
      toast.success("Đã tạo bài kiểm tra!");
    },
    onError: (err) => toast.error(err.message ?? "Tạo bài thất bại"),
  });

  const reset = () => {
    setTitle(""); setDescription(""); setDueDate(""); setSelectedSet(null);
    setQuery(""); setShowSearch(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate({
      classId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      studySetId: selectedSet?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-200 dark:shadow-none rounded-xl">
          <Plus size={14} />
          Tạo bài kiểm tra
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BookMarked size={20} className="text-purple-600" />
            </div>
            <div>
              <DialogTitle>Tạo bài kiểm tra mới</DialogTitle>
              <DialogDescription>Học sinh sẽ thấy và làm bài kiểm tra này trong lớp</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="asgn-title" className="text-sm">Tên bài kiểm tra <span className="text-red-500">*</span></Label>
            <Input
              id="asgn-title"
              placeholder="VD: Kiểm tra chương 1 — Từ vựng cơ bản"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required disabled={isPending} autoFocus
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="asgn-desc" className="text-sm">Mô tả <span className="text-gray-400 font-normal">(tuỳ chọn)</span></Label>
            <Input
              id="asgn-desc"
              placeholder="Hướng dẫn cho học sinh..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="rounded-xl"
            />
          </div>

          {/* Study Set picker */}
          <div className="space-y-1.5">
            <Label className="text-sm">Học phần gắn kèm <span className="text-gray-400 font-normal">(tuỳ chọn)</span></Label>

            {selectedSet ? (
              /* Selected display */
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20">
                <BookMarked size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-indigo-700 dark:text-indigo-300 truncate">
                  {selectedSet.title}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedSet(null); setQuery(""); }}
                  className="p-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Search/select */
              <div>
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-left text-sm text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                >
                  <Search size={14} />
                  <span className="flex-1">Tìm học phần theo tên hoặc mô tả...</span>
                  <ChevronDown size={14} className={`transition-transform ${showSearch ? "rotate-180" : ""}`} />
                </button>

                {showSearch && (
                  <div className="mt-2 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg">
                    {/* Search input */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      <Search size={13} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nhập tên hoặc mô tả học phần..."
                        className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
                      />
                      {isFetching && <Loader2 size={13} className="animate-spin text-gray-400" />}
                    </div>

                    {/* Results */}
                    <div className="max-h-44 overflow-y-auto">
                      {(loadingMine && !query) ? (
                        <div className="flex justify-center p-4">
                          <Loader2 size={18} className="animate-spin text-indigo-500" />
                        </div>
                      ) : filtered.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center p-4">
                          {query.trim().length > 1 ? "Không tìm thấy kết quả" : "Nhập tên để tìm kiếm"}
                        </p>
                      ) : (
                        filtered.map((set) => (
                          <button
                            key={set.id}
                            type="button"
                            onClick={() => { setSelectedSet({ id: set.id, title: set.title }); setShowSearch(false); setQuery(""); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 text-left"
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                              <BookMarked size={12} className="text-indigo-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{set.title}</p>
                              {set.description && (
                                <p className="text-[11px] text-gray-400 truncate">{set.description}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {set.isPublic ? "🌐" : "🔒"}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor="asgn-due" className="flex items-center gap-1.5 text-sm">
              <Calendar size={13} />
              Hạn nộp <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
            </Label>
            <Input
              id="asgn-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => { reset(); setOpen(false); }} disabled={isPending} className="rounded-xl">
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              {isPending ? <><Loader2 size={15} className="animate-spin mr-2" />Đang tạo...</> : "Tạo bài KT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
