import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { StudySetSchema } from "@acme/validators";

import { beDelete, beGet, bePost, bePut } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";
import type { FlashcardResponse } from "./flashcard";

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

  /** PUT /api/studysets/:id */
  update: protectedProcedure
    .input(StudySetSchema.extend({ id: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const flashcards = rest.flashcards.map((f, i) => ({ ...f, position: i }));
      const data = await bePut<any>(`/api/studysets/${id}`, { ...rest, flashcards }, ctx.token);
      return mapToFrontendStudySet(data);
    }),

  /** DELETE /api/studysets/:id */
  delete: protectedProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/studysets/${input.id}`, ctx.token);
    }),

  /** Combine — merge flashcards từ nhiều study sets thành set mới */
  combine: protectedProcedure
    .input(z.object({ id: z.string(), studySets: z.string().array() }))
    .mutation(async ({ input, ctx }) => {
      // Lấy flashcards từ set gốc + tất cả sets được chọn
      const allIds = [input.id, ...input.studySets];
      const allSets = await Promise.all(
        allIds.map((sid) => beGet<any>(`/api/studysets/${sid}`, ctx.token)),
      );
      const mergedFlashcards = allSets.flatMap((s: any) =>
        (s?.flashcards ?? []).map(({ term, definition, position }: FlashcardResponse) => ({
          term,
          definition,
          position,
        })),
      );
      const data = await bePost<any>(
        "/api/studysets",
        {
          title: `${allSets[0]?.title ?? "Combined"} (combined)`,
          description: `Combined from ${allIds.length} study sets`,
          flashcards: mergedFlashcards,
          isPublic: true,
        },
        ctx.token,
      );
      return mapToFrontendStudySet(data);
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
