"use client";

import { useState } from "react";
import { FolderPlus, Loader2, Check, FolderOpen } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface AddToFolderDialogProps {
  studySetId: number;
}

export default function AddToFolderDialog({ studySetId }: AddToFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: folders = [], isLoading } = api.folder.allByUser.useQuery(
    { userId: undefined },
    { enabled: open },
  );

  const addSet = api.folder.addSet.useMutation({
    onSuccess: () => {
      void utils.folder.allByUser.invalidate();
      toast.success("Đã thêm vào folder!");
    },
    onError: () => toast.error("Không thể thêm vào folder"),
  });

  const removeSet = api.folder.removeSet.useMutation({
    onSuccess: () => {
      void utils.folder.allByUser.invalidate();
      toast.success("Đã xoá khỏi folder");
    },
    onError: () => toast.error("Không thể xoá khỏi folder"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-indigo-500"
            >
              <FolderPlus size={15} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Thêm vào folder</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FolderOpen size={18} className="text-indigo-600" />
            </div>
            <DialogTitle>Thêm vào Folder</DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={22} className="animate-spin text-indigo-500" />
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FolderOpen size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Bạn chưa có folder nào</p>
            <p className="text-xs mt-1">Hãy tạo folder trong trang cá nhân trước</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto py-1">
            {folders.map((folder) => {
              const isIn = (folder.studySets as any[])?.some?.(
                (s: any) => s.id === studySetId,
              ) ?? false;
              const isPending =
                (addSet.isPending && addSet.variables?.folderId === folder.id) ||
                (removeSet.isPending && removeSet.variables?.folderId === folder.id);

              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    if (isIn) {
                      removeSet.mutate({ folderId: folder.id, studySetId });
                    } else {
                      addSet.mutate({ folderId: folder.id, studySetId });
                    }
                  }}
                  disabled={isPending}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isIn
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen
                      size={14}
                      className={isIn ? "text-indigo-500" : "text-gray-400"}
                    />
                    <span
                      className={`truncate font-medium ${isIn ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {folder.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-gray-400">
                      {folder.studySetsCount} bộ
                    </span>
                    {isPending ? (
                      <Loader2 size={13} className="animate-spin text-indigo-400" />
                    ) : isIn ? (
                      <Check size={13} className="text-indigo-500" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
