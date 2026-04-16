import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { EditFlashcardSchema } from "@acme/validators";

import { beDelete, beGetBlob, bePost, bePut } from "../lib/beClient";
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

export interface CloneResult {
  cloned: number;
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

  /**
   * POST /api/studysets/{id}/flashcards/import
   * Upload Excel file — trả về danh sách flashcards đã import
   */
  importExcel: protectedProcedure
    .input(
      z.object({
        studySetId: z.number(),
        /** Base64-encoded file content */
        fileBase64: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Decode base64 → Buffer → FormData-compatible Blob
      const binary = Buffer.from(input.fileBase64, "base64");
      const blob = new Blob([binary], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const formData = new FormData();
      formData.append("file", blob, input.fileName);

      const BE_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";
      const headers: Record<string, string> = {};
      if (ctx.token) headers["Authorization"] = `Bearer ${ctx.token}`;

      const res = await fetch(
        `${BE_BASE_URL}/api/studysets/${input.studySetId}/flashcards/import`,
        { method: "POST", headers, body: formData },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error((err as any).message ?? "Import failed");
      }
      return (await res.json()) as FlashcardResponse[];
    }),

  /**
   * GET /api/studysets/{id}/flashcards/export
   * Trả về { base64, contentType, filename } để client tải xuống
   */
  exportExcel: protectedProcedure
    .input(z.object({ studySetId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beGetBlob(
        `/api/studysets/${input.studySetId}/flashcards/export`,
        ctx.token,
      );
    }),

  /**
   * GET /api/flashcards/import/template
   * Tải file mẫu Excel
   */
  downloadTemplate: protectedProcedure.mutation(async ({ ctx }) => {
    return beGetBlob("/api/flashcards/import/template", ctx.token);
  }),

  /**
   * POST /api/flashcards/clone
   * Clone flashcards sang study set khác
   */
  clone: protectedProcedure
    .input(
      z.object({
        sourceStudySetId: z.number(),
        targetStudySetId: z.number(),
        flashcardIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return bePost<CloneResult>("/api/flashcards/clone", input, ctx.token);
    }),

  /**
   * POST /api/flashcards/parse-excel
   * Parse Excel và trả về [{term, definition}] — KHÔNG lưu DB.
   * Dùng khi tạo mới Study Set từ file Excel để populate form fields.
   */
  parseExcel: protectedProcedure
    .input(z.object({ fileBase64: z.string(), fileName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const binary = Buffer.from(input.fileBase64, "base64");
      const blob = new Blob([binary], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const formData = new FormData();
      formData.append("file", blob, input.fileName);

      const BE_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";
      const headers: Record<string, string> = {};
      if (ctx.token) headers["Authorization"] = `Bearer ${ctx.token}`;

      const res = await fetch(`${BE_BASE_URL}/api/flashcards/parse-excel`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error((err as any).message ?? "Parse failed");
      }
      return (await res.json()) as { term: string; definition: string }[];
    }),
} satisfies TRPCRouterRecord;
