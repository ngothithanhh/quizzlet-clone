"use client";

import { useState } from "react";
import {
  BookMarked,
  CheckSquare,
  ChevronRight,
  Copy,
  Loader2,
  Plus,
  Search,
  Square,
} from "lucide-react";

import type { RouterOutputs } from "@acme/api";
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

type Flashcard = RouterOutputs["studySet"]["byId"]["flashcards"][number];

interface CopyFlashcardsDialogProps {
  /** Flashcards của studyset hiện tại để chọn */
  flashcards: Flashcard[];
  /** StudySet đang xem (để loại khỏi target list) */
  currentStudySetId: number;
}

export default function CopyFlashcardsDialog({
  flashcards,
  currentStudySetId,
}: CopyFlashcardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select-cards" | "select-target">("select-cards");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetSetId, setTargetSetId] = useState<number | null>(null);
  const [targetSearch, setTargetSearch] = useState("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [mode, setMode] = useState<"existing" | "new">("existing");

  const utils = api.useUtils();

  const { data: mySets = [], isLoading } = api.studySet.allMine.useQuery(undefined, {
    enabled: open && step === "select-target",
  });

  const filteredSets = mySets.filter(
    (s) =>
      s.id !== currentStudySetId &&
      s.title.toLowerCase().includes(targetSearch.toLowerCase()),
  );

  // Clone selected flashcards → existing studyset
  const cloneMutation = api.flashcard.clone.useMutation({
    onSuccess: () => {
      toast.success(`Đã sao chép ${selected.size} flashcard thành công!`);
      void utils.studySet.invalidate();
      handleReset();
    },
    onError: (err) => toast.error(err.message ?? "Sao chép thất bại"),
  });

  // Create new studyset then clone into it
  const createMutation = api.studySet.create.useMutation({
    onSuccess: (newSet) => {
      cloneMutation.mutate({
        sourceStudySetId: currentStudySetId,
        targetStudySetId: newSet.id,
        flashcardIds: [...selected],
      });
    },
    onError: (err) => toast.error(err.message ?? "Tạo study set thất bại"),
  });

  const handleReset = () => {
    setOpen(false);
    setStep("select-cards");
    setSelected(new Set());
    setTargetSetId(null);
    setTargetSearch("");
    setNewSetTitle("");
    setMode("existing");
  };

  const toggleCard = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === flashcards.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(flashcards.map((f) => f.id)));
    }
  };

  const handleCopy = () => {
    if (mode === "new") {
      if (!newSetTitle.trim()) return;
      const selectedCards = flashcards.filter((f) => selected.has(f.id));
      createMutation.mutate({
        title: newSetTitle.trim(),
        description: `Sao chép ${selected.size} flashcard`,
        flashcards: selectedCards.map((f, i) => ({
          term: f.term,
          definition: f.definition,
          position: i,
        })),
      });
    } else {
      if (!targetSetId) return;
      cloneMutation.mutate({
        sourceStudySetId: currentStudySetId,
        targetStudySetId: targetSetId,
        flashcardIds: [...selected],
      });
    }
  };

  const isPending = cloneMutation.isPending || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
          <Copy size={13} />
          Sao chép flashcard
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Copy size={20} className="text-violet-600" />
            </div>
            <div>
              <DialogTitle>Sao chép Flashcards</DialogTitle>
              <DialogDescription>
                {step === "select-cards"
                  ? `Chọn flashcard để sao chép — ${selected.size}/${flashcards.length} đã chọn`
                  : "Chọn study set đích hoặc tạo mới"}
              </DialogDescription>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex gap-2 mt-3">
            {(["select-cards", "select-target"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                  step === s
                    ? "bg-violet-600 text-white"
                    : s === "select-target" && step === "select-cards"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    : "bg-violet-100 text-violet-600"
                }`}>{i + 1}</div>
                <span className={`text-xs ${step === s ? "font-semibold text-gray-900 dark:text-white" : "text-gray-400"}`}>
                  {s === "select-cards" ? "Chọn thẻ" : "Chọn đích"}
                </span>
                {i === 0 && <ChevronRight size={12} className="text-gray-300" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* ── Step 1: Select cards ── */}
        {step === "select-cards" && (
          <div className="space-y-3">
            {/* Select all */}
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              {selected.size === flashcards.length
                ? <CheckSquare size={14} />
                : <Square size={14} />}
              {selected.size === flashcards.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>

            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {flashcards.map((fc) => (
                <button
                  key={fc.id}
                  onClick={() => toggleCard(fc.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected.has(fc.id)
                      ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700"
                      : "border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    selected.has(fc.id) ? "bg-violet-600 border-violet-600" : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {selected.has(fc.id) && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fc.term}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{fc.definition}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Select target ── */}
        {step === "select-target" && (
          <div className="space-y-3">
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {(["existing", "new"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                    mode === m
                      ? "bg-white dark:bg-gray-900 shadow text-violet-600 dark:text-violet-400"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "existing" ? "Study set có sẵn" : <span className="flex items-center justify-center gap-1"><Plus size={11} />Tạo mới</span>}
                </button>
              ))}
            </div>

            {mode === "existing" ? (
              <>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm study set..."
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="pl-9 h-9 text-sm rounded-xl"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1.5">
                  {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 size={20} className="animate-spin text-violet-500" /></div>
                  ) : filteredSets.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-4">
                      {mySets.length <= 1 ? "Bạn không có study set nào khác" : "Không tìm thấy"}
                    </p>
                  ) : (
                    filteredSets.map((set) => (
                      <button
                        key={set.id}
                        onClick={() => setTargetSetId(set.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          targetSetId === set.id
                            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700"
                            : "border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                          <BookMarked size={13} className="text-violet-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{set.title}</p>
                          <p className="text-xs text-gray-400">{set.flashcardCount ?? 0} thuật ngữ</p>
                        </div>
                        {targetSetId === set.id && (
                          <div className="w-4 h-4 rounded-full bg-violet-600 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="new-set-title" className="text-sm">Tên study set mới</Label>
                <Input
                  id="new-set-title"
                  placeholder="VD: Từ vựng chương 3..."
                  value={newSetTitle}
                  onChange={(e) => setNewSetTitle(e.target.value)}
                  className="rounded-xl"
                  autoFocus
                />
                <p className="text-xs text-gray-400">
                  Sẽ tạo study set mới với {selected.size} flashcard đã chọn
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "select-cards" ? (
            <>
              <Button variant="outline" onClick={handleReset} className="rounded-xl">Huỷ</Button>
              <Button
                disabled={selected.size === 0}
                onClick={() => setStep("select-target")}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2"
              >
                Tiếp theo <ChevronRight size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("select-cards")} className="rounded-xl">Quay lại</Button>
              <Button
                disabled={isPending || (mode === "existing" ? !targetSetId : !newSetTitle.trim())}
                onClick={handleCopy}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2"
              >
                {isPending ? (
                  <><Loader2 size={14} className="animate-spin" />Đang sao chép...</>
                ) : (
                  <><Copy size={14} />Sao chép {selected.size} thẻ</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
