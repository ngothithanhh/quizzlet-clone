import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { EditFlashcardSchema } from "@acme/validators";

import { beDelete, bePost, bePut } from "../lib/beClient";
import { protectedProcedure } from "../trpc";

export interface FlashcardResponse {
  id: number;
  term: string;
  definition: string;
  position: number;
  studySetId: number;
  imageUrl?: string;
  audioUrl?: string;
}

export const flashcardRouter = {
  /** PUT /api/flashcards/:id */
  edit: protectedProcedure
    .input(EditFlashcardSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      return bePut<FlashcardResponse>(`/api/flashcards/${id}`, rest, ctx.token);
    }),

  /** POST /api/flashcards */
  create: protectedProcedure
    .input(
      z.object({
        studySetId: z.number(),
        term: z.string().min(1),
        definition: z.string().min(1),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return bePost<FlashcardResponse>("/api/flashcards", input, ctx.token);
    }),

  /** DELETE /api/flashcards/:id */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/flashcards/${input.id}`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
