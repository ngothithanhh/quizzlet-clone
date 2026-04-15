"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";

type StudyMode = "FLASHCARD" | "LEARN" | "MATCH" | "TEST";

interface UseStudySessionOptions {
  studySetId: number;
  mode: StudyMode;
  /** Nếu false, không auto-start (dùng khi studySetId chưa sẵn sàng) */
  enabled?: boolean;
}

export interface SessionSummary {
  sessionId: number;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  durationSeconds?: number;
}

export function useStudySession({ studySetId, mode, enabled = true }: UseStudySessionOptions) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const startedRef = useRef(false);
  const answerTimerRef = useRef<number>(Date.now());

  const startMutation = api.studySession.start.useMutation({
    onSuccess: (data) => {
      if (data?.id) setSessionId(data.id);
    },
    onError: (err) => {
      // Silent fail — tracking không block trải nghiệm học
      console.warn("[StudySession] start failed:", err.message);
    },
  });

  const answerMutation = api.studySession.answer.useMutation({
    onError: (err) => {
      console.warn("[StudySession] answer failed:", err.message);
    },
  });

  const endMutation = api.studySession.end.useMutation({
    onSuccess: (data) => {
      if (data) setSummary(data as SessionSummary);
    },
    onError: (err) => {
      console.warn("[StudySession] end failed:", err.message);
    },
  });

  // Auto-start khi component mount
  useEffect(() => {
    if (enabled && studySetId && !startedRef.current) {
      startedRef.current = true;
      answerTimerRef.current = Date.now();
      startMutation.mutate({ studySetId, mode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, studySetId]);

  /** Ghi nhận câu trả lời */
  const recordAnswer = useCallback(
    (flashcardId: number, correct: boolean) => {
      if (!sessionId) return;

      const timeSpent = Date.now() - answerTimerRef.current;
      answerTimerRef.current = Date.now(); // reset timer cho câu tiếp theo

      answerMutation.mutate({ sessionId, flashcardId, correct, timeSpent });
    },
    [sessionId, answerMutation],
  );

  /** Kết thúc phiên học, trả về summary */
  const endSession = useCallback(async (): Promise<SessionSummary | null> => {
    if (!sessionId) return null;
    return new Promise((resolve) => {
      endMutation.mutate(
        { sessionId },
        {
          onSuccess: (data) => resolve(data as SessionSummary ?? null),
          onError: () => resolve(null),
        },
      );
    });
  }, [sessionId, endMutation]);

  return {
    sessionId,
    summary,
    recordAnswer,
    endSession,
    isStarting: startMutation.isPending,
  };
}
