"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Copy,
  Crown,
  GraduationCap,
  Loader2,
  LogOut,
  RefreshCw,
  School,
  Trash2,
  Users,
  CheckCircle2,
  Settings,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";
import { toast } from "@acme/ui/toast";

import AssignmentsTab from "~/components/classroom/assignments-tab";
import MembersTab from "~/components/classroom/members-tab";
import StudySetsTab from "~/components/classroom/study-sets-tab";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/auth-context";

const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-violet-500 to-fuchsia-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-pink-500 to-purple-600",
];

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const router = useRouter();
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const utils = api.useUtils();

  const { data: classroom, isLoading } = api.classroom.byId.useQuery({ id: classId });

  const isCreator = classroom?.isCreator ?? false;
  const isTeacher = isCreator || classroom?.currentUserRole === "TEACHER";
  const gradient = GRADIENTS[(classId ?? 0) % GRADIENTS.length];

  const regenerateCode = api.classroom.regenerateInviteCode.useMutation({
    onSuccess: () => {
      void utils.classroom.byId.invalidate({ id: classId });
      toast.success("Đã tạo mã mời mới!");
    },
  });

  const leaveClass = api.classroom.leave.useMutation({
    onSuccess: () => router.push("/classes"),
    onError: (err) => toast.error(err.message ?? "Không thể rời lớp"),
  });

  const deleteClass = api.classroom.delete.useMutation({
    onSuccess: () => router.push("/classes"),
    onError: (err) => toast.error(err.message ?? "Không thể xóa lớp"),
  });

  const handleCopyCode = async () => {
    if (!classroom?.inviteCode) return;
    await navigator.clipboard.writeText(classroom.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
          <p className="text-gray-400 text-sm">Đang tải lớp học...</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────
  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <School size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Không tìm thấy lớp học</h2>
          <Button className="mt-4" onClick={() => router.push("/classes")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const initial = (classroom.name ?? "C").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container max-w-5xl py-8">

        {/* ── Back navigation ─────────────────────────────────────── */}
        <button
          onClick={() => router.push("/classes")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-7 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách lớp
        </button>

        {/* ── Hero Card ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20 mb-7">
          {/* Banner */}
          <div className={`h-36 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

            {/* Class initial avatar */}
            <div className="absolute bottom-4 left-6 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-black">{initial}</span>
            </div>

            {/* Role badge in banner */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs gap-1">
                {isCreator ? (
                  <><Crown size={10} className="text-amber-300" /> Chủ lớp</>
                ) : classroom?.currentUserRole === "TEACHER" ? (
                  <><GraduationCap size={10} /> Giáo viên</>
                ) : (
                  <><Users size={10} /> Học sinh</>
                )}
              </Badge>
            </div>

            {/* Actions on banner */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {!isCreator && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-white/90 hover:text-white hover:bg-white/20 text-xs backdrop-blur-sm border border-white/20"
                  onClick={() => leaveClass.mutate({ id: classId })}
                  disabled={leaveClass.isPending}
                >
                  {leaveClass.isPending ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
                  Rời lớp
                </Button>
              )}
              {isCreator && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-white/90 hover:text-white hover:bg-red-500/40 text-xs backdrop-blur-sm border border-white/20"
                    >
                      <Trash2 size={12} /> Xoá lớp
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Trash2 size={18} className="text-red-600" />
                        </div>
                        <div>
                          <DialogTitle>Xác nhận xoá lớp</DialogTitle>
                          <DialogDescription className="text-xs mt-0.5">
                            Tất cả dữ liệu sẽ bị xoá vĩnh viễn.
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3 mt-1">
                      Hành động xoá lớp <strong>"{classroom.name}"</strong> không thể hoàn tác. Tất cả thành viên, bài kiểm tra và học phần liên quan sẽ bị xoá.
                    </p>
                    <DialogFooter className="gap-2 mt-2">
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Huỷ</Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteClass.mutate({ id: classId })}
                        disabled={deleteClass.isPending}
                        className="gap-2"
                      >
                        {deleteClass.isPending && <Loader2 size={14} className="animate-spin" />}
                        Xoá lớp
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Info section */}
          <div className="p-6 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {classroom.name}
                </h1>
                {classroom.description && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm leading-relaxed">
                    {classroom.description}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Users size={13} className="text-indigo-500" />
                    </div>
                    <span><strong className="text-gray-900 dark:text-white">{classroom.memberCount ?? 0}</strong> thành viên</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                      <School size={13} className="text-purple-500" />
                    </div>
                    <span>Giáo viên: <strong className="text-gray-900 dark:text-white">{classroom.ownerUsername ?? "—"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Invite code section */}
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Mã mời</p>
                    <code className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 tracking-[0.25em]">
                      {classroom.inviteCode}
                    </code>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors text-indigo-400 hover:text-indigo-600"
                      title="Sao chép"
                    >
                      {copiedCode ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => regenerateCode.mutate({ id: classId })}
                        disabled={regenerateCode.isPending}
                        className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors text-indigo-400 hover:text-indigo-600 disabled:opacity-40"
                        title="Tạo mã mới"
                      >
                        {regenerateCode.isPending
                          ? <Loader2 size={14} className="animate-spin" />
                          : <RefreshCw size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                {copiedCode && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Đã sao chép mã mời!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs defaultValue="studysets" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 h-auto shadow-sm w-full sm:w-auto flex">
            <TabsTrigger
              value="studysets"
              className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-5 py-2.5 gap-2 text-sm font-medium transition-all"
            >
              <BookMarked size={15} />
              Học phần
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-5 py-2.5 gap-2 text-sm font-medium transition-all"
            >
              <BookOpen size={15} />
              Bài kiểm tra
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-5 py-2.5 gap-2 text-sm font-medium transition-all"
            >
              <Users size={15} />
              Thành viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studysets" className="mt-0">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <StudySetsTab classId={classId} isCreator={isCreator} isTeacher={isTeacher} />
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-0">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <AssignmentsTab classId={classId} isCreator={isCreator} isTeacher={isTeacher} />
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <MembersTab classId={classId} isCreator={isCreator} isTeacher={isTeacher} ownerId={classroom.ownerId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
