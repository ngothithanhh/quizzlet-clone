import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beDelete, beGet, bePost, bePut } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";

interface FolderResponse {
  id: number;
  name: string;
  description?: string;
  userId: number;
  studySets?: unknown[];
  slug: string;
  studySetsCount: number;
}

const mapToFrontendFolder = (beFolder: any): FolderResponse => ({
  ...beFolder,
  userId: beFolder.userId || 1, // Fallback if missing
  slug: beFolder.id ? beFolder.id.toString() : "",
  studySetsCount: beFolder.studySets ? beFolder.studySets.length : 0,
});

export const folderRouter = {
  /** GET /api/folders — folders của user hiện tại */
  allByUser: publicProcedure
    .input(z.object({ userId: z.string().or(z.number()).optional() }))
    .query(async ({ ctx }) => {
      const data = await beGet<any[]>("/api/folders", ctx.token);
      return (data || []).map(mapToFrontendFolder);
    }),

  /** POST /api/folders */
  create: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<FolderResponse>("/api/folders", input, ctx.token);
    }),

  /** GET /api/folders/:id */
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().or(z.number()) }))
    .query(async ({ input, ctx }) => {
      const data = await beGet<any>(`/api/folders/${input.slug}`, ctx.token);
      return mapToFrontendFolder(data);
    }),

  /** POST /api/folders/:folderId/studysets/:studySetId */
  addSet: protectedProcedure
    .input(z.object({ folderId: z.string().or(z.number()), studySetId: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return bePost<void>(
        `/api/folders/${input.folderId}/studysets/${input.studySetId}`,
        undefined,
        ctx.token,
      );
    }),

  /** DELETE /api/folders/:folderId/studysets/:studySetId */
  removeSet: protectedProcedure
    .input(z.object({ folderId: z.string().or(z.number()), studySetId: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(
        `/api/folders/${input.folderId}/studysets/${input.studySetId}`,
        ctx.token,
      );
    }),

  /** PUT /api/folders/:id */
  edit: protectedProcedure
    .input(z.object({ id: z.string().or(z.number()), name: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      return bePut<FolderResponse>(`/api/folders/${id}`, rest, ctx.token);
    }),

  /** DELETE /api/folders/:id */
  delete: protectedProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/folders/${input.id}`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
