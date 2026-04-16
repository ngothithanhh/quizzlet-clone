"use client";

import Link from "next/link";
import { BookOpen, Copy, Crown, Users } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";

interface ClassroomResponse {
  id: number;
  name?: string;
  description?: string;
  inviteCode: string;
  ownerId: number;
  memberCount?: number;
  assignments?: unknown[];
  isCreator?: boolean;
}

interface ClassCardProps {
  classroom: ClassroomResponse;
  onCopyCode?: (code: string) => void;
}

export default function ClassCard({ classroom, onCopyCode }: ClassCardProps) {
  const displayName = (classroom.name ?? "").trim() || "Class";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {displayName}
              </h3>
              {classroom.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {classroom.description}
                </p>
              )}
            </div>
          </div>
          {classroom.isCreator && (
            <Badge variant="secondary" className="flex-shrink-0 text-xs gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Crown size={10} />
              Giáo viên
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Users size={13} />
            <span>{classroom.memberCount ?? 0} thành viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} />
            <span>{classroom.assignments?.length ?? 0} bài KT</span>
          </div>
        </div>

        {/* Invite Code */}
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xs text-gray-400">Mã mời:</span>
          <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex-1 truncate">
            {classroom.inviteCode}
          </code>
          <button
            onClick={() => onCopyCode?.(classroom.inviteCode)}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Sao chép mã mời"
          >
            <Copy size={12} className="text-gray-400" />
          </button>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <Link href={`/classes/${classroom.id}`}>
            Vào lớp học
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
