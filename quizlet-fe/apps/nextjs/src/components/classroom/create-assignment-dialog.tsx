"use client";

import { useState } from "react";
import { Calendar, Loader2, Plus } from "lucide-react";

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

interface CreateAssignmentDialogProps {
  classId: number;
}

export default function CreateAssignmentDialog({ classId }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [studySetId, setStudySetId] = useState("");

  const utils = api.useUtils();

  const { mutate, isPending } = api.classroom.createAssignment.useMutation({
    onSuccess: () => {
      void utils.classroom.assignments.invalidate({ classId });
      setOpen(false);
      setTitle(""); setDescription(""); setDueDate(""); setStudySetId("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate({
      classId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      studySetId: studySetId ? Number(studySetId) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus size={14} />
          Tạo bài kiểm tra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo bài kiểm tra mới</DialogTitle>
          <DialogDescription>
            Học sinh sẽ thấy và làm bài kiểm tra này trong lớp
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="assign-title">Tên bài kiểm tra *</Label>
            <Input
              id="assign-title"
              placeholder="VD: Kiểm tra chương 1..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required disabled={isPending} autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-desc">Mô tả</Label>
            <Input
              id="assign-desc"
              placeholder="Hướng dẫn cho học sinh..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-set">ID Study Set (tuỳ chọn)</Label>
            <Input
              id="assign-set"
              type="number"
              placeholder="Để trống nếu không cần"
              value={studySetId}
              onChange={(e) => setStudySetId(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-due" className="flex items-center gap-2">
              <Calendar size={13} />
              Hạn nộp
            </Label>
            <Input
              id="assign-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? (
                <><Loader2 size={15} className="animate-spin mr-2" />Đang tạo...</>
              ) : "Tạo bài KT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
