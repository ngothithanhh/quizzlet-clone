import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { StudySetSchema } from "@acme/validators";

import { beDelete, beGet, bePost, bePut } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";

export interface FlashcardResponse {
  id: number;
  term: string;
  definition: string;
  position: number;
  studySetId: number;
  imageUrl?: string;
  audioUrl?: string;
}

export interface StudySetResponse {
  id: number;
  title: string;
  description?: string;
  isPublic: boolean;
  userId: number;
  flashcards: FlashcardResponse[];
  flashcardCount: number;
  user?: { id: number; name: string; email: string; image?: string };
  createdAt: string;
  updatedAt: string;
}

export const mapToFrontendStudySet = (beSet: any): StudySetResponse => ({
  ...beSet,
  user: {
    id: beSet.userId || 0,
    name: beSet.createdBy || "Anonymous",
    email: "", // Not provided by BE study set endpoint
    image: undefined,
  },
});



export const studySetRouter = {
  /** GET /api/studysets — tất cả study set public */
  popular: publicProcedure.query(async ({ ctx }) => {
    const data = await beGet<any[]>("/api/studysets", ctx.token);
    return (data || []).map(mapToFrontendStudySet);
  }),

  /** GET /api/studysets — latest (dùng chung endpoint) */
  latest: publicProcedure.query(async ({ ctx }) => {
    const data = await beGet<any[]>("/api/studysets", ctx.token);
    return (data || []).map(mapToFrontendStudySet);
  }),

  /** GET /api/studysets/me — study sets của user hiện tại */
  allByUser: publicProcedure
    .input(z.object({ userId: z.string().or(z.number()).optional() }))
    .query(async ({ ctx }) => {
      // /api/studysets/me requires auth — return empty if no token
      if (!ctx.token) return [];
      const data = await beGet<any[]>("/api/studysets/me", ctx.token);
      return (data || []).map(mapToFrontendStudySet);
    }),

  /** GET /api/studysets/:id */
  byId: publicProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .query(async ({ input, ctx }) => {
      const data = await beGet<any>(`/api/studysets/${input.id}`, ctx.token);
      return mapToFrontendStudySet(data);
    }),

  /** Other study sets of the same user */
  other: publicProcedure
    .input(z.object({ studySetId: z.string().or(z.number()), userId: z.string().or(z.number()) }))
    .query(async ({ ctx }) => {
      const data = await beGet<any[]>("/api/studysets/me", ctx.token);
      return (data || []).map(mapToFrontendStudySet);
    }),

  /** POST /api/studysets */
  create: protectedProcedure
    .input(StudySetSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await bePost<any>(
        "/api/studysets",
        {
          title: input.title,
          description: input.description,
          flashcards: input.flashcards,
          isPublic: true,
        },
        ctx.token,
      );
      return mapToFrontendStudySet(data);
    }),

  /** DELETE /api/studysets/:id */
  delete: protectedProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/studysets/${input.id}`, ctx.token);
    }),

  /** Match cards — lấy flashcards rồi tạo pairs trên FE */
  matchCards: publicProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .query(async ({ input, ctx }) => {
      // Gọi endpoint BE trả sẵn mảng shuffled [flashcardId, content]
      return beGet<
        { flashcardId: number; content: string }[]
      >(`/api/studysets/${input.id}/match`, ctx.token);
    }),

  /** Learn cards — multiple choice */
  learnCards: publicProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .query(async ({ input, ctx }) => {
      return beGet<
        {
          id: number;
          term: string;
          definition: string;
          position: number;
          studySetId: number;
          answers: string[];
        }[]
      >(`/api/studysets/${input.id}/learn`, ctx.token);
    }),

  /** Test cards */
  testCards: publicProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .query(async ({ input, ctx }) => {
      return beGet<{
        trueOrFalse: {
          id: number;
          term: string;
          definition: string;
          answer: string;
        }[];
        written: {
          id: number;
          term: string;
          definition: string;
          position: number;
          studySetId: number;
        }[];
        multipleChoice: {
          id: number;
          term: string;
          definition: string;
          position: number;
          studySetId: number;
          answers: string[];
        }[];
      }>(`/api/studysets/${input.id}/test`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
