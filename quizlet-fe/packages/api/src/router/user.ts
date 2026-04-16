import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beDelete, beGet, bePut } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";

export interface UserProfileResponse {
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
      // /api/users/me requires auth — return null if no token
      if (!ctx.token) return null;
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

  /** GET /api/users/search */
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.query.trim()) return [];
      const params = new URLSearchParams({ q: input.query });
      const data = await beGet<UserProfileResponse[]>(`/api/users/search?${params}`, ctx.token);
      return data ?? [];
    }),
} satisfies TRPCRouterRecord;
