"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, CheckCircle2, Clock, Loader2, Trophy } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Progress } from "@acme/ui/progress";

import { api } from "~/trpc/react";
import CreateAssignmentDialog from "./create-assignment-dialog";

interface AssignmentsTabProps {
  classId: number;
  isCreator: boolean;
}

function formatDate(str?: string) {
  if (!str) return null;
  return new Date(str).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AssignmentsTab({ classId, isCreator }: AssignmentsTabProps) {
  const { data: assignments = [], isLoading } = api.classroom.assignments.useQuery({ classId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isCreator && (
        <div className="flex justify-end mb-2">
          <CreateAssignmentDialog classId={classId} />
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có bài kiểm tra nào</p>
          {isCreator && (
            <p className="text-xs mt-1">Nhấn "Tạo bài kiểm tra" để thêm bài đầu tiên</p>
          )}
        </div>
      ) : (
        assignments.map((assignment) => (
          <Card key={assignment.id} className="border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <BookOpen size={18} className="text-indigo-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                      {assignment.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] flex-shrink-0 gap-1">
                      <Trophy size={9} />
                      {assignment.questionsCount ?? 0} câu
                    </Badge>
                  </div>

                  {assignment.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {assignment.description}
                    </p>
                  )}

                  {assignment.dueDate && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <CalendarDays size={12} />
                      <span>Hạn: {formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2 justify-end">
                <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3">
                  <Link href={`/classes/${classId}/assignments/${assignment.id}`}>
                    {isCreator ? "Xem kết quả" : "Làm bài"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
