"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Loader2, Plus, School } from "lucide-react";

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

interface CreateClassDialogProps {
  onSuccess?: () => void;
}

export default function CreateClassDialog({ onSuccess }: CreateClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = api.useUtils();

  const { mutate, isPending } = api.classroom.create.useMutation({
    onSuccess: (data) => {
      void utils.classroom.allMine.invalidate();
      setCreatedCode(data?.inviteCode ?? null);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message ?? "Tạo lớp thất bại"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({ name: name.trim(), description: description.trim() || undefined });
  };

  const handleCopy = async () => {
    if (!createdCode) return;
    await navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setCreatedCode(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus size={16} />
          Tạo lớp mới
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {createdCode ? (
          /* ── Success screen: show invite code ── */
          <>
            <DialogHeader>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <div>
                  <DialogTitle>Tạo lớp thành công!</DialogTitle>
                  <DialogDescription className="mt-1">
                    Chia sẻ mã mời bên dưới để học sinh tham gia lớp
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="my-2 flex flex-col items-center gap-4">
              <div className="w-full rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-6 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Mã mời vào lớp</p>
                <code className="text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-[0.3em]">
                  {createdCode}
                </code>
              </div>

              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/20"
              >
                {copied ? (
                  <><CheckCircle2 size={15} className="text-green-500" /> Đã sao chép!</>
                ) : (
                  <><Copy size={15} /> Sao chép mã mời</>
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Hoàn tất
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* ── Create form ── */
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <School size={20} className="text-indigo-600" />
                </div>
                <div>
                  <DialogTitle>Tạo lớp học mới</DialogTitle>
                  <DialogDescription>
                    Tạo lớp để chia sẻ bài học và kiểm tra với học sinh
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="class-name">Tên lớp học *</Label>
                <Input
                  id="class-name"
                  placeholder="VD: Toán 12A, Tiếng Anh nâng cao..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-desc">Mô tả (tuỳ chọn)</Label>
                <Input
                  id="class-desc"
                  placeholder="Mô tả ngắn về lớp học..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isPending ? (
                    <><Loader2 size={15} className="animate-spin mr-2" />Đang tạo...</>
                  ) : "Tạo lớp"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
