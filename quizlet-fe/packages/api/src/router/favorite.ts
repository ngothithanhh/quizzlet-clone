import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beDelete, beGet, bePost } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";
import type { StudySetResponse } from "./studySet";
import { mapToFrontendStudySet } from "./studySet";

export const favoriteRouter = {
  /** GET /api/favorites — danh sách study sets đã yêu thích */
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.token) return [];
    const data = await beGet<any[]>("/api/favorites", ctx.token);
    return (data || []).map(mapToFrontendStudySet);
  }),

  /** POST /api/favorites/:studySetId */
  add: protectedProcedure
    .input(z.object({ studySetId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<void>(`/api/favorites/${input.studySetId}`, undefined, ctx.token);
    }),

  /** DELETE /api/favorites/:studySetId */
  remove: protectedProcedure
    .input(z.object({ studySetId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/favorites/${input.studySetId}`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
