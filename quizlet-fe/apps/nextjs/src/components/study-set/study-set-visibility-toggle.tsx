"use client";

import { useState } from "react";
import { Check, ChevronDown, Globe, Loader2, Lock, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface StudySetVisibilityToggleProps {
  studySetId: number;
  isPublic: boolean;
}

const OPTIONS = [
  {
    value: true,
    label: "Công khai",
    description: "Tất cả mọi người có thể tìm thấy và xem học phần này",
    icon: Globe,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    badgeBg: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  {
    value: false,
    label: "Riêng tư",
    description: "Chỉ có bạn mới thấy học phần này",
    icon: Lock,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
    badgeBg: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
] as const;

export default function StudySetVisibilityToggle({
  studySetId,
  isPublic,
}: StudySetVisibilityToggleProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const mutation = api.studySet.setVisibility.useMutation({
    onSuccess: (data) => {
      void utils.studySet.invalidate();
      const label = data.isPublic ? "Công khai" : "Riêng tư";
      toast.success(`Đã đổi chế độ sang ${label}`);
      setOpen(false);
    },
    onError: (err) => toast.error(err.message ?? "Không thể thay đổi chế độ hiển thị"),
  });

  const current = OPTIONS.find((o) => o.value === isPublic) ?? OPTIONS[1];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger disabled={mutation.isPending} asChild>
        <button
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80 ${current.badgeBg}`}
          title="Cài đặt quyền riêng tư"
        >
          {mutation.isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <CurrentIcon size={12} />
          )}
          {current.label}
          <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-2" sideOffset={6}>
        <DropdownMenuLabel className="flex items-center gap-2 px-2 pb-2 text-xs text-gray-500">
          <Settings size={12} />
          Cài đặt quyền riêng tư
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-1" />

        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = opt.value === isPublic;
          const isPending = mutation.isPending && mutation.variables?.isPublic === opt.value;

          return (
            <DropdownMenuItem
              key={String(opt.value)}
              onSelect={(e) => {
                e.preventDefault();
                if (!isSelected && !mutation.isPending) {
                  mutation.mutate({ id: studySetId, isPublic: opt.value });
                }
              }}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer mb-1 border transition-all ${
                isSelected
                  ? opt.bg
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent"
              }`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                isSelected ? "bg-white dark:bg-gray-900/50" : "bg-gray-100 dark:bg-gray-800"
              }`}>
                {isPending ? (
                  <Loader2 size={15} className="animate-spin text-gray-400" />
                ) : (
                  <Icon size={15} className={opt.color} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <span className="flex-shrink-0">
                      <Check size={13} className="text-green-600" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                  {opt.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="mt-1 mb-1" />
        <p className="px-2 py-1 text-[11px] text-gray-400 leading-tight">
          💡 Học phần riêng tư sẽ không xuất hiện khi người khác tìm kiếm
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
