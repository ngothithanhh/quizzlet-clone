"use client";

import {
  Crown,
  GraduationCap,
  Loader2,
  MoreVertical,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toast";

import { useAuth } from "~/contexts/auth-context";
import { api } from "~/trpc/react";
import AddMemberDialog from "./add-member-dialog";

interface ClassMemberResponse {
  userId: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: "TEACHER" | "STUDENT" | "CREATOR" | "MEMBER";
  isCreator?: boolean;
}

interface MembersTabProps {
  classId: number;
  isCreator: boolean;
  isTeacher?: boolean;   // Creator OR Teacher
  ownerId?: number;
}

// ─── Avatar color palette ────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
];

// ─── Single row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  isMe,
  canRemove,
  canChangeRole,
  classId,
}: {
  member: ClassMemberResponse;
  isMe: boolean;
  canRemove: boolean;
  canChangeRole: boolean;
  classId: number;
}) {
  const utils = api.useUtils();
  const color = AVATAR_COLORS[member.userId % AVATAR_COLORS.length];

  const removeMember = api.classroom.removeMember.useMutation({
    onSuccess: () => {
      void utils.classroom.members.invalidate({ classId });
      toast.success("Đã xóa thành viên khỏi lớp");
    },
    onError: (err) => toast.error(err.message ?? "Không thể xóa thành viên"),
  });

  const updateRole = api.classroom.updateMemberRole.useMutation({
    onSuccess: () => {
      void utils.classroom.members.invalidate({ classId });
      toast.success("Đã cập nhật vai trò");
    },
    onError: (err) => toast.error(err.message ?? "Không thể đổi vai trò"),
  });

  const isStudent = member.role === "STUDENT" || member.role === "MEMBER";
  const isTeacherRole = member.role === "TEACHER" || member.role === "CREATOR";

  const showMenu = !isMe && (canRemove || canChangeRole);

  return (
    <div className="group flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
      <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-white dark:ring-gray-900 shadow-sm">
        <AvatarImage src={member.avatarUrl} alt={member.username} />
        <AvatarFallback className={`text-sm font-bold ${color}`}>
          {member.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {member.username}
          </span>
          {isMe && (
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md leading-none">
              Bạn
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{member.email}</p>
      </div>

      <div className="hidden sm:flex items-center gap-1.5">
        {member.isCreator ? (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <Crown size={10} /> Chủ lớp
          </span>
        ) : isTeacherRole ? (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
            <GraduationCap size={10} /> Giáo viên
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <UserCheck size={10} /> Học sinh
          </span>
        )}
      </div>

      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
              {member.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Chỉ Creator mới đổi được role */}
            {canChangeRole && !member.isCreator && (
              <DropdownMenuItem
                onClick={() =>
                  updateRole.mutate({
                    classId,
                    userId: member.userId,
                    role: isTeacherRole ? "STUDENT" : "TEACHER",
                  })
                }
                disabled={updateRole.isPending}
              >
                <Shield size={14} className="mr-2 text-indigo-500" />
                {isTeacherRole ? "Đổi thành Học sinh" : "Phong Giáo viên"}
              </DropdownMenuItem>
            )}

            {/* Xóa — Creator với mọi người, Teacher chỉ với Student */}
            {canRemove && (
              <>
                {canChangeRole && !member.isCreator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                  onClick={() => removeMember.mutate({ classId, userId: member.userId })}
                  disabled={removeMember.isPending}
                >
                  <Trash2 size={14} className="mr-2" />
                  Xóa khỏi lớp
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function Section({
  title,
  iconBg,
  icon,
  members,
  emptyMsg,
  currentUserId,
  isCreator,
  isTeacher,
  classId,
  memberType,
}: {
  title: string;
  iconBg: string;
  icon: React.ReactNode;
  members: ClassMemberResponse[];
  emptyMsg?: string;
  currentUserId?: number;
  isCreator: boolean;
  isTeacher: boolean;
  classId: number;
  /** "creator" | "teacher" | "student" */
  memberType: "creator" | "teacher" | "student";
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h3>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
          {members.length}
        </span>
      </div>
      <div className="h-px bg-gray-100 dark:bg-gray-800 mb-2 ml-9" />

      {members.length === 0 ? (
        <p className="text-xs text-gray-400 pl-9 italic">{emptyMsg}</p>
      ) : (
        <div>
          {members.map((m) => {
            const isMe = m.userId === currentUserId;
            // canRemove: Creator xóa được tất cả (trừ creator); Teacher chỉ xóa student
            const canRemove = !m.isCreator && (
              isCreator || (isTeacher && memberType === "student")
            );
            // canChangeRole: chỉ Creator mới đổi role
            const canChangeRole = isCreator && !m.isCreator;

            return (
              <MemberRow
                key={m.userId}
                member={m}
                isMe={isMe}
                canRemove={canRemove}
                canChangeRole={canChangeRole}
                classId={classId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function MembersTab({
  classId,
  isCreator,
  isTeacher = false,
  ownerId,
}: MembersTabProps) {
  const { user } = useAuth();
  const { data: members = [], isLoading } = api.classroom.members.useQuery({ classId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const creatorMember = members.find((m) => m.isCreator || (ownerId && m.userId === ownerId));
  const teachers = members.filter(
    (m) =>
      (m.role === "TEACHER" || m.role === "CREATOR") &&
      !m.isCreator &&
      m.userId !== creatorMember?.userId,
  );
  const students = members.filter((m) => m.role === "STUDENT" || m.role === "MEMBER");

  // Teacher được thêm học sinh; Creator được thêm bất kỳ ai
  const canAddMember = isCreator || isTeacher;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <Users size={18} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Thành viên</h2>
            <p className="text-xs text-gray-400">
              {members.length} người • {teachers.length} giáo viên • {students.length} học sinh
            </p>
          </div>
        </div>
        {canAddMember && <AddMemberDialog classId={classId} />}
      </div>

      {/* Role-based permission note */}
      {isTeacher && !isCreator && (
        <div className="mb-5 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 px-3 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
          <GraduationCap size={14} />
          Bạn là giáo viên — có thể thêm và xóa học sinh trong lớp.
        </div>
      )}

      {/* ── Creator ──────────────────────────────────────────────── */}
      {creatorMember && (
        <Section
          title="Chủ lớp"
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          icon={<Crown size={13} className="text-amber-500" />}
          members={[creatorMember]}
          currentUserId={user?.id}
          isCreator={isCreator}
          isTeacher={isTeacher}
          classId={classId}
          memberType="creator"
        />
      )}

      {/* ── Teachers ─────────────────────────────────────────────── */}
      <Section
        title="Giáo viên"
        iconBg="bg-indigo-50 dark:bg-indigo-900/20"
        icon={<GraduationCap size={13} className="text-indigo-500" />}
        members={teachers}
        emptyMsg="Chưa có giáo viên phụ nào"
        currentUserId={user?.id}
        isCreator={isCreator}
        isTeacher={isTeacher}
        classId={classId}
        memberType="teacher"
      />

      {/* ── Students ─────────────────────────────────────────────── */}
      <Section
        title="Học sinh"
        iconBg="bg-green-50 dark:bg-green-900/20"
        icon={<UserCheck size={13} className="text-green-500" />}
        members={students}
        emptyMsg="Chưa có học sinh nào tham gia"
        currentUserId={user?.id}
        isCreator={isCreator}
        isTeacher={isTeacher}
        classId={classId}
        memberType="student"
      />
    </div>
  );
}
