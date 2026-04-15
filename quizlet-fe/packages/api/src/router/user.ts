import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beDelete, beGet, bePut } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";

interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export const userRouter = {
  /** GET /api/users/me */
  byId: publicProcedure
    .input(z.object({ id: z.string().or(z.number()).optional() }))
    .query(async ({ ctx }) => {
      return beGet<UserProfileResponse>("/api/users/me", ctx.token);
    }),

  /** PUT /api/users/me */
  update: protectedProcedure
    .input(z.object({ image: z.string().optional(), username: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return bePut<UserProfileResponse>("/api/users/me", input, ctx.token);
    }),

  /** DELETE /api/users/:id */
  delete: protectedProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/users/${input.id}`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
