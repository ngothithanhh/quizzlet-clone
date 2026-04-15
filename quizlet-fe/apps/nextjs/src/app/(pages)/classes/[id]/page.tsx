"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Loader2,
  LogOut,
  RefreshCw,
  School,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import AssignmentsTab from "~/components/classroom/assignments-tab";
import MembersTab from "~/components/classroom/members-tab";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/auth-context";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const router = useRouter();
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const utils = api.useUtils();

  const { data: classroom, isLoading } = api.classroom.byId.useQuery({ id: classId });

  const isCreator = classroom?.isCreator ?? classroom?.ownerId === user?.id;

  const regenerateCode = api.classroom.regenerateInviteCode.useMutation({
    onSuccess: () => void utils.classroom.byId.invalidate({ id: classId }),
  });

  const leaveClass = api.classroom.leave.useMutation({
    onSuccess: () => router.push("/classes"),
  });

  const deleteClass = api.classroom.delete.useMutation({
    onSuccess: () => router.push("/classes"),
  });

  const handleCopyCode = async () => {
    if (!classroom?.inviteCode) return;
    await navigator.clipboard.writeText(classroom.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm text-gray-400">Đang tải lớp học...</p>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-xl font-bold text-gray-700">Không tìm thấy lớp học</h2>
        <Button className="mt-4" onClick={() => router.push("/classes")}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.push("/classes")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách lớp
      </button>

      {/* Header card */}
      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 flex-shrink-0">
                {classroom.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {classroom.name}
                </h1>
                {classroom.description && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                    {classroom.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users size={13} />
                    <span>{classroom.memberCount ?? 0} thành viên</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={isCreator
                      ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20 text-xs"
                      : "text-xs"
                    }
                  >
                    {isCreator ? "👑 Giáo viên" : "Học sinh"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900"
                  onClick={() => leaveClass.mutate({ id: classId })}
                  disabled={leaveClass.isPending}
                >
                  {leaveClass.isPending ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                  Rời lớp
                </Button>
              )}
              {isCreator && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 size={13} />
                      Xoá lớp
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Xác nhận xoá lớp</DialogTitle>
                      <DialogDescription>
                        Tất cả dữ liệu lớp sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Huỷ</Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteClass.mutate({ id: classId })}
                        disabled={deleteClass.isPending}
                      >
                        {deleteClass.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                        Xoá lớp
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Invite code section */}
          <div className="mt-5 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex-shrink-0">
              <School size={16} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Mã mời vào lớp</p>
              <code className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
                {classroom.inviteCode}
              </code>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleCopyCode}
              >
                <Copy size={12} />
                {copiedCode ? "Đã chép!" : "Sao chép"}
              </Button>
              {isCreator && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-gray-500"
                  onClick={() => regenerateCode.mutate({ id: classId })}
                  disabled={regenerateCode.isPending}
                  title="Tạo mã mới"
                >
                  {regenerateCode.isPending
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RefreshCw size={12} />
                  }
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="assignments">
        <TabsList className="mb-6">
          <TabsTrigger value="assignments" className="gap-2">
            <BookOpen size={14} />
            Bài kiểm tra
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users size={14} />
            Thành viên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <AssignmentsTab classId={classId} isCreator={isCreator} />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab classId={classId} isCreator={isCreator} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
