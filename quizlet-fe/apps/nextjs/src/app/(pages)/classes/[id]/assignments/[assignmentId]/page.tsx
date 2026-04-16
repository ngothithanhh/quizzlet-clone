"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit2,
  GraduationCap,
  History,
  Loader2,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import MultipleChoiceCard from "~/components/shared/multiple-choice-card";
import TrueFalseCard from "~/components/shared/true-false-card";
import WrittenCard from "~/components/shared/written-card";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/auth-context";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}p ${s}s` : `${s}s`;
}

export default function AssignmentDetailPage() {
  const { id: classId, assignmentId } = useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const aId = Number(assignmentId);

  const { data: classroom } = api.classroom.byId.useQuery({ id: Number(classId) });
  const { data: assignment, isLoading: loadingAssignment, refetch: refetchAssignment } = api.classroom.assignmentById.useQuery({ assignmentId: aId });
  const { data: myAttempts = [], isLoading: loadingAttempts, refetch: refetchAttempts } = api.classroom.myAttempts.useQuery({ assignmentId: aId });
  const isTeacher = classroom?.isCreator || classroom?.currentUserRole === "TEACHER";

  const { data: submissions = [], isLoading: loadingSubmissions } = api.classroom.submissions.useQuery(
    { assignmentId: aId },
    { enabled: !!isTeacher },
  );

  const studySetId = assignment?.studySetId;
  const { data: testCards, isLoading: isLoadingCards } = api.studySet.testCards.useQuery(
    { id: studySetId! },
    { enabled: !!studySetId },
  );

  const allCards = [
    ...(testCards?.trueOrFalse ?? []).map((c) => ({ ...c, type: "tf" as const })),
    ...(testCards?.multipleChoice ?? []).map((c) => ({ ...c, type: "mc" as const })),
    ...(testCards?.written ?? []).map((c) => ({ ...c, type: "written" as const })),
  ];

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"history" | "taking">("history");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [answers, setAnswers] = useState<
    Record<number, { userAnswer: string; correctAnswer: string; isCorrect: boolean; term: string }>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    score: number; correctAnswers: number; totalQuestions: number; allowReview: boolean; answerDetails: any[];
  } | null>(null);

  const submitMutation = api.classroom.submitAssignment.useMutation({
    onSuccess: () => {
      toast.success("Nộp bài thành công!");
      void refetchAttempts();
      // Refetch assignment to get latest allowReviewAnswers from server
      void refetchAssignment();
    },
    onError: (err) => toast.error(err.message ?? "Nộp bài thất bại"),
  });

  const startQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setSubmittedData(null);
    setStartTime(Date.now());
    if (assignment?.timeLimitMinutes) {
      setTimeLeft(assignment.timeLimitMinutes * 60);
    } else {
      setTimeLeft(null);
    }
    setMode("taking");
  };

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { void handleSubmit(true); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted, handleSubmit]);

  const handleAnswer = useCallback((flashcardId: number, term: string, userAnswer: string, correctAnswer: string) => {
    // Case-insensitive + trim whitespace comparison
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setAnswers((prev) => ({ ...prev, [flashcardId]: { userAnswer, correctAnswer, isCorrect, term } }));
  }, []);

  // Wrapper for TrueFalse: value is "true"|"false" radio string
  const handleTFAnswer = useCallback((card: any, radioValue: string) => {
    // "true" means student thinks the displayed answer IS correct (answer === definition)
    // The correct radio choice is "true" if card.answer === card.definition, else "false"
    const correctRadio = card.answer === card.definition ? "true" : "false";
    handleAnswer(card.id, card.term, radioValue, correctRadio);
  }, [handleAnswer]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitted) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Build answer details for ALL questions (including unanswered)
    const answerList = allCards.map((card) => {
      const ans = answers[card.id];
      if (ans) {
        return { flashcardId: card.id, term: ans.term, userAnswer: ans.userAnswer, correctAnswer: ans.correctAnswer, isCorrect: ans.isCorrect };
      }
      // Unanswered question
      return { flashcardId: card.id, term: card.term, userAnswer: "", correctAnswer: card.definition ?? "", isCorrect: false };
    });

    const correctAnswers = answerList.filter((a) => a.isCorrect).length;
    const totalQuestions = allCards.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    setSubmitted(true);
    setSubmittedData({ score, correctAnswers, totalQuestions, allowReview: assignment?.allowReviewAnswers !== false, answerDetails: answerList });
    // Switch to history mode so ResultView renders (instead of showing answers on quiz page)
    setMode("history");
    submitMutation.mutate({ assignmentId: aId, score, correctAnswers, totalQuestions, durationSeconds, answers: answerList });
    if (autoSubmit) toast.info("Hết giờ! Bài thi đã được tự động nộp.");
  }, [submitted, answers, allCards, aId, assignment, startTime, submitMutation]);

  if (loadingAssignment) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-500" /></div>;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEACHER VIEW
  // ──────────────────────────────────────────────────────────────────────────
  if (isTeacher) {
    return <TeacherView assignment={assignment} classId={classId} submissions={submissions} loadingSubmissions={loadingSubmissions} aId={aId} />;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STUDENT VIEW — HISTORY
  // ──────────────────────────────────────────────────────────────────────────
  if (mode === "history") {
    const attemptsUsed = myAttempts.length;
    const maxAttempts = assignment?.maxAttempts ?? null;
    const canTakeMore = !maxAttempts || attemptsUsed < maxAttempts;

    // After submit show result
    if (submitted && submittedData) {
      return <ResultView submittedData={submittedData} assignment={assignment} onBack={() => { setSubmitted(false); setMode("history"); }} classId={classId} />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-8">
        <div className="container max-w-2xl">
          <button onClick={() => router.push(`/classes/${classId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft size={15} /> Quay lại lớp học
          </button>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 mb-4">
            <h1 className="text-xl font-black text-gray-900 dark:text-white mb-1">{assignment?.title}</h1>
            <p className="text-sm text-gray-400">
              {assignment?.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {assignment?.timeLimitMinutes && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 flex items-center gap-1">
                  <Clock size={10} /> {assignment.timeLimitMinutes} phút
                </span>
              )}
              {allCards.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                  {allCards.length} câu hỏi
                </span>
              )}
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 flex items-center gap-1">
                <History size={10} /> {attemptsUsed}{maxAttempts ? `/${maxAttempts}` : ""} lần nộp
              </span>
            </div>

            <div className="mt-5">
              {canTakeMore && (isLoadingCards || allCards.length > 0) ? (
                isLoadingCards ? (
                  <div className="flex justify-center py-3"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
                ) : (
                  <Button onClick={startQuiz} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                    <Send size={16} /> {attemptsUsed === 0 ? "Bắt đầu làm bài" : "Làm lại bài"}
                  </Button>
                )
              ) : !canTakeMore ? (
                <p className="text-center text-sm text-red-500 font-medium">Bạn đã hết lượt nộp bài (tối đa {maxAttempts} lần)</p>
              ) : (
                <p className="text-center text-sm text-gray-400">Học phần này chưa có câu hỏi</p>
              )}
            </div>
          </div>

          {/* Attempt history */}
          {loadingAttempts ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
          ) : myAttempts.length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <History size={14} /> Lịch sử làm bài
              </h3>
              <div className="space-y-2">
                {myAttempts.map((attempt) => {
                  const pct = attempt.score ?? 0;
                  return (
                    <StudentAttemptRow key={attempt.id} attempt={attempt} pct={pct} allowReview={assignment?.allowReviewAnswers ?? true} />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STUDENT VIEW — TAKING QUIZ
  // ──────────────────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-8">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white">{assignment?.title}</h1>
            <p className="text-xs text-gray-400">{allCards.length} câu hỏi</p>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${
                timeLeft < 60 ? "bg-red-100 text-red-600 dark:bg-red-900/30 animate-pulse" :
                timeLeft < 300 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" :
                "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"
              }`}>
                <Clock size={14} />{formatTime(timeLeft)}
              </div>
            )}
            <Button onClick={() => void handleSubmit(false)} disabled={submitMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
              {submitMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Nộp bài ({answeredCount}/{allCards.length})
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {allCards.map((card, index) => (
            <AssignmentQuestionCard
              key={`${card.type}-${card.id}-${index}`}
              index={index}
              card={card}
              userAnswer={answers[card.id]?.userAnswer}
              submitted={submitted}
              onAnswer={handleAnswer}
              onTFAnswer={handleTFAnswer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Teacher View (extracted) ────────────────────────────────────────────────
function TeacherView({ assignment, classId, submissions, loadingSubmissions, aId }: any) {
  const router = useRouter();
  const utils = api.useUtils();
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [editMaxAttempts, setEditMaxAttempts] = useState("");
  const [editAllowReview, setEditAllowReview] = useState(true);

  const openEdit = () => {
    setEditTitle(assignment?.title ?? "");
    setEditDesc(assignment?.description ?? "");
    setEditLimit(assignment?.timeLimitMinutes?.toString() ?? "");
    setEditMaxAttempts(assignment?.maxAttempts?.toString() ?? "");
    setEditAllowReview(assignment?.allowReviewAnswers ?? true);
    setEditOpen(true);
  };

  const updateMutation = api.classroom.updateAssignment.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật bài kiểm tra!");
      void utils.classroom.assignmentById.invalidate({ assignmentId: aId });
      void utils.classroom.assignments.invalidate({ classId: assignment?.classId });
      setEditOpen(false);
    },
    onError: (err) => toast.error(err.message ?? "Cập nhật thất bại"),
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    const tl = editLimit ? parseInt(editLimit, 10) : null;
    const ma = editMaxAttempts ? parseInt(editMaxAttempts, 10) : null;
    updateMutation.mutate({
      assignmentId: aId,
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      timeLimitMinutes: (tl && !isNaN(tl)) ? tl : null,
      maxAttempts: (ma && !isNaN(ma)) ? ma : null,
      allowReviewAnswers: editAllowReview,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-8">
      <div className="container max-w-4xl">
        <button onClick={() => router.push(`/classes/${assignment?.classId ?? classId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Quay lại lớp học
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Trophy size={22} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{assignment?.title}</h1>
              <p className="text-sm text-gray-400">
                {assignment?.timeLimitMinutes ? `⏱ ${assignment.timeLimitMinutes} phút` : "Không giới hạn thời gian"}
                {assignment?.maxAttempts ? ` • Tối đa ${assignment.maxAttempts} lần nộp` : ""}
                {" • "}{assignment?.allowReviewAnswers ? "✅ Cho xem đáp án" : "🚫 Không cho xem đáp án"}
              </p>
            </div>
            <button onClick={openEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 text-gray-500 hover:text-indigo-600 transition-colors flex-shrink-0">
              <Edit2 size={13} /> Sửa
            </button>
          </div>
        </div>

        {/* Edit dialog */}
        {editOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="font-black text-lg text-gray-900 dark:text-white mb-4">Chỉnh sửa bài kiểm tra</h2>
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên bài kiểm tra</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian (phút)</label>
                    <input type="number" min={1} value={editLimit} onChange={(e) => setEditLimit(e.target.value)}
                      placeholder="Không giới hạn"
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lần nộp tối đa</label>
                    <input type="number" min={1} value={editMaxAttempts} onChange={(e) => setEditMaxAttempts(e.target.value)}
                      placeholder="Không giới hạn"
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="allow-review" checked={editAllowReview} onChange={(e) => setEditAllowReview(e.target.checked)} className="rounded" />
                  <label htmlFor="allow-review" className="text-sm text-gray-700 dark:text-gray-300">Cho học sinh xem đáp án sau khi nộp</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditOpen(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Huỷ
                  </button>
                  <button type="submit" disabled={updateMutation.isPending}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60">
                    {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <GraduationCap size={18} /> Kết quả học sinh ({submissions.length} lượt nộp)
        </h2>
        {loadingSubmissions ? (
          <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Clock size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có học sinh nào nộp bài</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub: any) => {
              const pct = sub.score ?? 0;
              let details: any[] = [];
              try { details = sub.answersJson ? JSON.parse(sub.answersJson) : []; } catch {}
              return <TeacherSubmissionRow key={sub.id} sub={sub} pct={pct} details={details} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultView({ submittedData, assignment, onBack, classId }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-10">
      <div className="container max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Lịch sử làm bài
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            submittedData.score >= 80 ? "bg-green-100 dark:bg-green-900/30" :
            submittedData.score >= 50 ? "bg-yellow-100 dark:bg-yellow-900/30" :
            "bg-red-100 dark:bg-red-900/30"}`}>
            {submittedData.score >= 80
              ? <CheckCircle2 size={36} className="text-green-500" />
              : <AlertCircle size={36} className={submittedData.score >= 50 ? "text-yellow-500" : "text-red-500"} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{assignment?.title}</h1>
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2 mt-4">{submittedData.score}%</div>
          <p className="text-gray-500 text-sm mb-8">{submittedData.correctAnswers}/{submittedData.totalQuestions} câu đúng</p>

          {(assignment?.allowReviewAnswers !== false) && submittedData.answerDetails.length > 0 && (
            <div className="text-left space-y-2 mt-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">Chi tiết từng câu</h3>
              {submittedData.answerDetails.map((a: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${a.isCorrect ? "bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800/30" : "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800/30"}`}>
                  {a.isCorrect ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.term}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bạn: <span className={a.isCorrect ? "text-green-600 font-medium" : "text-red-500 line-through"}>{a.userAnswer || "(bỏ trống)"}</span>
                      {!a.isCorrect && <span className="ml-2 text-green-600 font-medium">→ {a.correctAnswer}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {assignment?.allowReviewAnswers === false && (
            <p className="text-xs text-gray-400 mt-4">Giáo viên không cho phép xem đáp án chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentAttemptRow({ attempt, pct, allowReview }: any) {
  const [expanded, setExpanded] = useState(false);
  let details: any[] = [];
  try { details = attempt.answersJson ? JSON.parse(attempt.answersJson) : []; } catch {}

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"
        }`}>{pct}%</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Lần {attempt.attemptNumber}</p>
          <p className="text-xs text-gray-400">
            {attempt.correctAnswers}/{attempt.totalQuestions} đúng • {attempt.durationSeconds ? `${Math.floor(attempt.durationSeconds / 60)}p ${attempt.durationSeconds % 60}s` : "—"}
            {attempt.completedAt && ` • ${new Date(attempt.completedAt).toLocaleString("vi-VN")}`}
          </p>
        </div>
        <Badge variant="outline" className={`flex-shrink-0 text-xs ${pct >= 80 ? "border-green-300 text-green-600" : pct >= 50 ? "border-yellow-300 text-yellow-600" : "border-red-300 text-red-600"}`}>
          {pct >= 80 ? "Giỏi" : pct >= 50 ? "Đạt" : "Chưa đạt"}
        </Badge>
      </button>
      {expanded && allowReview && details.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-50 dark:border-gray-800 pt-3">
          {details.map((a: any, i: number) => (
            <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${a.isCorrect ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
              {a.isCorrect ? <CheckCircle2 size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />}
              <span className="font-medium text-gray-700 dark:text-gray-300">{a.term}: </span>
              <span className={a.isCorrect ? "text-green-600" : "text-red-500 line-through"}>{a.userAnswer || "(bỏ trống)"}</span>
              {!a.isCorrect && <span className="text-green-600 ml-1">→ {a.correctAnswer}</span>}
            </div>
          ))}
        </div>
      )}
      {expanded && !allowReview && (
        <p className="px-4 pb-4 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-800 pt-3">Giáo viên không cho phép xem đáp án.</p>
      )}
    </div>
  );
}

function TeacherSubmissionRow({ sub, pct, details }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
          {sub.username?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{sub.username}</p>
          <p className="text-xs text-gray-400">
            Lần {sub.attemptNumber} • {sub.correctAnswers}/{sub.totalQuestions} đúng
            {sub.durationSeconds && ` • ${Math.floor(sub.durationSeconds / 60)}p ${sub.durationSeconds % 60}s`}
          </p>
        </div>
        <Badge variant="outline" className={`flex-shrink-0 text-xs ${pct >= 80 ? "border-green-300 text-green-600" : pct >= 50 ? "border-yellow-300 text-yellow-600" : "border-red-300 text-red-600"}`}>
          {pct}% • {pct >= 80 ? "Giỏi" : pct >= 50 ? "Đạt" : "Chưa đạt"}
        </Badge>
      </button>
      {expanded && details.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-50 dark:border-gray-800 pt-3">
          {details.map((a: any, i: number) => (
            <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${a.isCorrect ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
              {a.isCorrect ? <CheckCircle2 size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />}
              <span className="font-medium text-gray-700 dark:text-gray-300">{a.term}: </span>
              <span className={a.isCorrect ? "text-green-600" : "text-red-500 line-through"}>{a.userAnswer || "(bỏ trống)"}</span>
              {!a.isCorrect && <span className="text-green-600 ml-1">→ {a.correctAnswer}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentQuestionCard({
  index, card, userAnswer, submitted, onAnswer, onTFAnswer,
}: {
  index: number;
  card: any;
  userAnswer?: string;
  submitted: boolean;
  onAnswer: (id: number, term: string, userAnswer: string, correctAnswer: string) => void;
  onTFAnswer: (card: any, radioValue: string) => void;
}) {
  const qNum = `Câu ${index + 1}`;

  if (card.type === "tf") {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">{qNum} • Đúng / Sai</p>
        <TrueFalseCard
          index={index}
          term={card.term}
          answer={card.answer}
          // Only reveal correct answer coloring AFTER submission
          definition={submitted ? card.definition : undefined}
          userAnswer={userAnswer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTFAnswer(card, e.target.value)}
        />
      </div>
    );
  }

  if (card.type === "mc") {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">{qNum} • Chọn đáp án đúng</p>
        <MultipleChoiceCard
          index={index}
          term={card.term}
          answers={card.answers ?? []}
          // Only reveal correct answer coloring AFTER submission
          definition={submitted ? card.definition : undefined}
          userAnswer={userAnswer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onAnswer(card.id, card.term, e.target.value, card.definition)
          }
        />
      </div>
    );
  }

  // written
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 font-medium">{qNum} • Tự điền</p>
      <WrittenCard
        term={card.term}
        // Only show correct answer hint AFTER submission
        definition={submitted ? card.definition : undefined}
        userAnswer={submitted ? (userAnswer ?? "") : (userAnswer || undefined)}
        readOnly={submitted}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onAnswer(card.id, card.term, e.target.value, card.definition)
        }
      />
    </div>
  );
}
