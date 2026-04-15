"use client";

import { useState } from "react";
import { Copy, Loader2, Search, Share2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
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
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface CloneFlashcardsDialogProps {
  currentStudySetId: number;
}

export default function CloneFlashcardsDialog({ currentStudySetId }: CloneFlashcardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetSetId, setTargetSetId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const utils = api.useUtils();
  const { data: myStudySets = [] } = api.studySet.allByUser.useQuery(
    { userId: undefined },
    { enabled: open },
  );

  const filteredSets = myStudySets.filter(
    (s) =>
      s.id !== currentStudySetId &&
      s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const cloneMutation = api.flashcard.clone.useMutation({
    onSuccess: (data) => {
      toast.success(`Đã clone ${(data as any).cloned ?? "tất cả"} flashcard!`);
      void utils.studySet.invalidate();
      setOpen(false);
      setTargetSetId("");
    },
    onError: (err) => toast.error(err.message ?? "Clone thất bại"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
          <Copy size={13} />
          Clone cards
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Copy size={20} className="text-purple-600" />
            </div>
            <div>
              <DialogTitle>Clone Flashcards</DialogTitle>
              <DialogDescription>
                Sao chép toàn bộ flashcards sang một study set khác
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm study set..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Study set list */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 border rounded-xl p-2">
            {filteredSets.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">
                {myStudySets.length <= 1 ? "Bạn không có study set nào khác" : "Không tìm thấy"}
              </p>
            ) : (
              filteredSets.map((set) => (
                <label
                  key={set.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    targetSetId === String(set.id)
                      ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="target-set"
                    value={set.id}
                    checked={targetSetId === String(set.id)}
                    onChange={() => setTargetSetId(String(set.id))}
                    className="accent-purple-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{set.title}</p>
                    <p className="text-xs text-gray-400">{set.flashcards?.length ?? 0} thuật ngữ</p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
          <Button
            disabled={!targetSetId || cloneMutation.isPending}
            onClick={() =>
              cloneMutation.mutate({
                sourceStudySetId: currentStudySetId,
                targetStudySetId: Number(targetSetId),
              })
            }
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {cloneMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />Đang clone...</>
            ) : "Clone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
