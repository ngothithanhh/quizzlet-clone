import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { bePost } from "../lib/beClient";
import { protectedProcedure } from "../trpc";

export interface SessionResponse {
  id: number;
  studySetId: number;
  mode: string;
  startedAt?: string;
  endedAt?: string;
  totalCards?: number;
  correctCount?: number;
  accuracy?: number;
}

export interface AnswerResponse {
  success: boolean;
}

export interface SessionSummary {
  sessionId: number;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  durationSeconds?: number;
}

export const studySessionRouter = {
  /** POST /api/study/start */
  start: protectedProcedure
    .input(z.object({
      studySetId: z.number(),
      mode: z.enum(["FLASHCARD", "LEARN", "MATCH", "TEST"]),
    }))
    .mutation(async ({ input, ctx }) => {
      return bePost<SessionResponse>("/api/study/start", input, ctx.token);
    }),

  /** POST /api/study/answer */
  answer: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      flashcardId: z.number(),
      correct: z.boolean(),
      timeSpent: z.number().optional(), // milliseconds
    }))
    .mutation(async ({ input, ctx }) => {
      return bePost<AnswerResponse>("/api/study/answer", input, ctx.token);
    }),

  /** POST /api/study/end */
  end: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<SessionSummary>("/api/study/end", input, ctx.token);
    }),
} satisfies TRPCRouterRecord;
