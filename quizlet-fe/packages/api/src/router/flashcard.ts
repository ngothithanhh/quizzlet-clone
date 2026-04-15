import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { EditFlashcardSchema } from "@acme/validators";

import { bePut } from "../lib/beClient";
import { protectedProcedure } from "../trpc";

interface FlashcardResponse {
  id: number;
  term: string;
  definition: string;
  position: number;
  studySetId: number;
}

export const flashcardRouter = {
  /** PUT /api/flashcards/:id */
  edit: protectedProcedure
    .input(EditFlashcardSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      return bePut<FlashcardResponse>(`/api/flashcards/${id}`, rest, ctx.token);
    }),
} satisfies TRPCRouterRecord;
