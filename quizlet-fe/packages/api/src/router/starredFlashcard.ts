import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beDelete, bePost } from "../lib/beClient";
import { protectedProcedure } from "../trpc";

export const starredFlashcardRouter = {
  /** POST /api/favorites/:studySetId */
  create: protectedProcedure
    .input(z.object({ flashcardId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<void>(`/api/favorites/${input.flashcardId}`, undefined, ctx.token);
    }),

  /** DELETE /api/favorites/:studySetId */
  delete: protectedProcedure
    .input(z.object({ flashcardId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/favorites/${input.flashcardId}`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
