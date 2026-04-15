"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader } from "@acme/ui/card";
import { Progress } from "@acme/ui/progress";

import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/auth-context";

export default function AssignmentDetailPage() {
  const { id: classId, assignmentId } = useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const assignId = Number(assignmentId);

  const { data: classroom } = api.classroom.byId.useQuery({ id: Number(classId) });
  const { data: myResult, isLoading: loadingResult } = api.classroom.myResult.useQuery({
    assignmentId: assignId,
  });
  const { data: submissions = [] } = api.classroom.submissions.useQuery(
    { assignmentId: assignId },
    { enabled: classroom?.isCreator ?? false },
  );
  const { data: assignments = [] } = api.classroom.assignments.useQuery({ classId: Number(classId) });

  const assignment = assignments.find((a) => a.id === assignId);

  const isCreator = classroom?.isCreator ?? false;
  const hasSubmitted = !!myResult;

  const submitMutation = api.classroom.submitAssignment.useMutation({
    onSuccess: () => void router.refresh(),
  });

  const utils = api.useUtils();

  if (loadingResult) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  // Teacher: xem tất cả submissions
  if (isCreator) {
    return (
      <div className="container py-8 max-w-3xl">
        <button
          onClick={() => router.push(`/classes/${classId}`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại lớp học
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Trophy size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {assignment?.title ?? "Bài kiểm tra"}
            </h1>
            <p className="text-sm text-gray-500">Kết quả từ học sinh</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Clock size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có học sinh nào nộp bài</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const pct = sub.totalQuestions > 0
                ? Math.round((sub.score / sub.totalQuestions) * 100)
                : 0;
              return (
                <Card key={sub.id} className="border border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {sub.username?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{sub.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {sub.score}/{sub.totalQuestions} ({pct}%)
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={pct >= 80 ? "border-green-300 text-green-600" : pct >= 50 ? "border-yellow-300 text-yellow-600" : "border-red-300 text-red-600"}
                    >
                      {pct >= 80 ? "Giỏi" : pct >= 50 ? "Đạt" : "Chưa đạt"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Student: đã nộp → xem kết quả
  if (hasSubmitted && myResult) {
    const pct = myResult.totalQuestions > 0
      ? Math.round((myResult.score / myResult.totalQuestions) * 100)
      : 0;

    return (
      <div className="container py-8 max-w-2xl">
        <button
          onClick={() => router.push(`/classes/${classId}`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại lớp học
        </button>

        <Card className="mb-6 border-0 shadow-xl overflow-hidden">
          <div className={`h-2 ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} />
          <CardContent className="p-8 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-4 ${
              pct >= 80 ? "bg-green-100 text-green-600" : pct >= 50 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
            }`}>
              {pct}%
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {assignment?.title}
            </h2>
            <p className="text-gray-500 text-sm mb-6">Kết quả bài làm của bạn</p>

            <div className="flex justify-center gap-8 text-sm">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="font-bold text-xl text-green-600">{myResult.score}</span>
                <span className="text-gray-400 text-xs">Đúng</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <XCircle size={20} className="text-red-400" />
                <span className="font-bold text-xl text-red-500">{myResult.totalQuestions - myResult.score}</span>
                <span className="text-gray-400 text-xs">Sai</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award size={20} className="text-indigo-500" />
                <span className="font-bold text-xl text-indigo-600">{myResult.totalQuestions}</span>
                <span className="text-gray-400 text-xs">Tổng câu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => router.push(`/classes/${classId}`)} className="w-full">
          Quay lại lớp học
        </Button>
      </div>
    );
  }

  // Student: chưa nộp → thông báo chờ
  return (
    <div className="container py-8 max-w-2xl text-center">
      <button
        onClick={() => router.push(`/classes/${classId}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors mx-auto"
      >
        <ArrowLeft size={16} />
        Quay lại lớp học
      </button>
      <Card className="border-0 shadow-xl p-10">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
          <Send size={28} className="text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">{assignment?.title ?? "Bài kiểm tra"}</h2>
        <p className="text-gray-500 text-sm mb-6">
          {assignment?.description ?? "Bài kiểm tra này được thực hiện trực tiếp qua study set của lớp."}
        </p>
        {assignment?.studySetId && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => router.push(`/study-sets/${assignment.studySetId}/learn`)}
          >
            Làm bài qua Study Set
          </Button>
        )}
      </Card>
    </div>
  );
}
