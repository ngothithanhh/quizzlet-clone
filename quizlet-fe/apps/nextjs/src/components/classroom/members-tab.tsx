"use client";

import { useState } from "react";
import { Crown, Loader2, MoreVertical, Shield, Trash2, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

interface ClassMemberResponse {
  userId: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: "CREATOR" | "MEMBER";
}

import { useAuth } from "~/contexts/auth-context";
import { api } from "~/trpc/react";

interface MembersTabProps {
  classId: number;
  isCreator: boolean;
}

export default function MembersTab({ classId, isCreator }: MembersTabProps) {
  const { user } = useAuth();
  const utils = api.useUtils();

  const { data: members = [], isLoading } = api.classroom.members.useQuery({ classId });

  const removeMember = api.classroom.removeMember.useMutation({
    onSuccess: () => void utils.classroom.members.invalidate({ classId }),
  });

  const updateRole = api.classroom.updateMemberRole.useMutation({
    onSuccess: () => void utils.classroom.members.invalidate({ classId }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {members.length} thành viên
        </p>
      </div>

      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={member.avatarUrl} alt={member.username} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
              {member.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {member.username}
              </span>
              {member.userId === user?.id && (
                <span className="text-[10px] text-indigo-500 font-medium">(bạn)</span>
              )}
            </div>
            <span className="text-xs text-gray-400 truncate">{member.email}</span>
          </div>

          <Badge
            variant="outline"
            className={`flex-shrink-0 text-[11px] gap-1 ${
              member.role === "CREATOR"
                ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                : "border-gray-200 text-gray-500"
            }`}
          >
            {member.role === "CREATOR" ? <Crown size={9} /> : <User size={9} />}
            {member.role === "CREATOR" ? "Giáo viên" : "Học sinh"}
          </Badge>

          {/* Actions (chỉ creator mới thấy, không tự xoá chính mình) */}
          {isCreator && member.userId !== user?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    updateRole.mutate({
                      classId,
                      userId: member.userId,
                      role: member.role === "CREATOR" ? "MEMBER" : "CREATOR",
                    })
                  }
                >
                  <Shield size={14} className="mr-2" />
                  {member.role === "CREATOR" ? "Hạ xuống Học sinh" : "Thăng Giáo viên"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => removeMember.mutate({ classId, userId: member.userId })}
                >
                  <Trash2 size={14} className="mr-2" />
                  Xoá khỏi lớp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}

      {members.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <User size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có thành viên nào</p>
        </div>
      )}
    </div>
  );
}
