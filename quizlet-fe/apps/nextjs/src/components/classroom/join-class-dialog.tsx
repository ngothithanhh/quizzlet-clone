"use client";

import { useState } from "react";
import { Hash, Loader2, Users } from "lucide-react";

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

interface JoinClassDialogProps {
  onSuccess?: () => void;
}

export default function JoinClassDialog({ onSuccess }: JoinClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const utils = api.useUtils();

  const { mutate, isPending } = api.classroom.join.useMutation({
    onSuccess: () => {
      void utils.classroom.allMine.invalidate();
      setOpen(false);
      setInviteCode("");
      setError("");
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message ?? "Mã mời không hợp lệ hoặc đã hết hạn");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!inviteCode.trim()) return;
    mutate({ inviteCode: inviteCode.trim().toUpperCase() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(""); setInviteCode(""); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users size={16} />
          Tham gia lớp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Hash size={20} className="text-green-600" />
            </div>
            <div>
              <DialogTitle>Tham gia lớp học</DialogTitle>
              <DialogDescription>
                Nhập mã mời do giáo viên cung cấp để tham gia lớp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Mã mời</Label>
            <Input
              id="invite-code"
              placeholder="Nhập mã mời (VD: ABC123)"
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(""); }}
              required
              disabled={isPending}
              autoFocus
              className="text-center font-mono text-lg tracking-widest uppercase"
              maxLength={10}
            />
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
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
              disabled={isPending || !inviteCode.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  Đang tham gia...
                </>
              ) : (
                "Tham gia"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
