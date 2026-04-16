"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Loader2,
  Plus,
  Trophy,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import CreateAssignmentDialog from "./create-assignment-dialog";

interface AssignmentsTabProps {
  classId: number;
  isCreator: boolean;
  isTeacher?: boolean;   // Creator OR Teacher
}

function formatDate(str?: string) {
  if (!str) return null;
  return new Date(str).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isOverdue(str?: string) {
  if (!str) return false;
  return new Date(str) < new Date();
}

export default function AssignmentsTab({ classId, isCreator, isTeacher = false }: AssignmentsTabProps) {
  const canCreate = isCreator || isTeacher;
  const { data: assignments = [], isLoading } = api.classroom.assignments.useQuery({ classId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <ClipboardList size={18} className="text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Bài kiểm tra</h2>
            <p className="text-xs text-gray-400">{assignments.length} bài</p>
          </div>
        </div>
        {canCreate && <CreateAssignmentDialog classId={classId} />}
      </div>

      {assignments.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
            <BookOpen size={32} className="text-purple-300 dark:text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">Chưa có bài kiểm tra nào</p>
            {canCreate ? (
              <p className="text-sm text-gray-400 mt-1">
                Nhấn "Tạo bài kiểm tra" để thêm bài đầu tiên cho lớp
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                Giáo viên chưa tạo bài kiểm tra nào
              </p>
            )}
          </div>
          {canCreate && <CreateAssignmentDialog classId={classId} />}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate);
            return (
              <div
                key={assignment.id}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md hover:shadow-indigo-50 dark:hover:shadow-indigo-900/20 transition-all bg-white dark:bg-gray-900/50"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center">
                  <BookOpen size={18} className="text-purple-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {assignment.title}
                    </h3>
                    {overdue && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Quá hạn</Badge>
                    )}
                  </div>

                  {assignment.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {assignment.description}
                    </p>
                  )}

                  {assignment.dueDate && (
                    <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${overdue ? "text-red-400" : "text-gray-400"}`}>
                      <CalendarDays size={11} />
                      <span>Hạn nộp: {formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <Link
                  href={`/classes/${classId}/assignments/${assignment.id}`}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all"
                >
                  {isCreator ? "Xem kết quả" : "Làm bài"}
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
