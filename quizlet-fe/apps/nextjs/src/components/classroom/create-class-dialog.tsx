"use client";

import { useState } from "react";
import { Loader2, Plus, School } from "lucide-react";

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

import { api } from "~/trpc/react";

interface CreateClassDialogProps {
  onSuccess?: () => void;
}

export default function CreateClassDialog({ onSuccess }: CreateClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = api.useUtils();

  const { mutate, isPending } = api.classroom.create.useMutation({
    onSuccess: () => {
      void utils.classroom.allMine.invalidate();
      setOpen(false);
      setName("");
      setDescription("");
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({ name: name.trim(), description: description.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus size={16} />
          Tạo lớp mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                "Tạo lớp"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
