import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beGet, bePost } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";

export interface TtsResponse {
  audioUrl: string;
}

export interface TranslateResponse {
  result: string;
  from?: string;
  to?: string;
}

export interface SpellcheckResponse {
  correct: boolean;
  suggestions?: string[];
  corrected?: string;
}

export interface UploadResponse {
  url: string;
  publicId?: string;
}

export const externalApiRouter = {
  /**
   * GET /api/external/tts?text=...&lang=...
   * Text-to-speech — trả về URL audio
   */
  tts: publicProcedure
    .input(z.object({ text: z.string().min(1), lang: z.string().default("en") }))
    .query(async ({ input, ctx }) => {
      const params = new URLSearchParams({ text: input.text, lang: input.lang });
      return beGet<TtsResponse>(`/api/external/tts?${params}`, ctx.token);
    }),

  /**
   * GET /api/external/translate?text=...&from=...&to=...
   * Dịch thuật
   */
  translate: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        from: z.string().default("auto"),
        to: z.string().default("vi"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const params = new URLSearchParams({ text: input.text, from: input.from, to: input.to });
      return beGet<TranslateResponse>(`/api/external/translate?${params}`, ctx.token);
    }),

  /**
   * POST /api/external/spellcheck
   * Kiểm tra chính tả
   */
  spellcheck: publicProcedure
    .input(z.object({ text: z.string().min(1), lang: z.string().default("en") }))
    .mutation(async ({ input, ctx }) => {
      return bePost<SpellcheckResponse>("/api/external/spellcheck", input, ctx.token);
    }),

  /**
   * POST /api/external/upload/image
   * Upload ảnh cho flashcard — gửi base64, nhận URL
   */
  uploadImage: protectedProcedure
    .input(
      z.object({
        /** Base64 encoded image */
        base64: z.string(),
        fileName: z.string().default("image.jpg"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const BE_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";
      const headers: Record<string, string> = {};
      if (ctx.token) headers["Authorization"] = `Bearer ${ctx.token}`;

      const binary = Buffer.from(input.base64, "base64");
      const blob = new Blob([binary]);
      const formData = new FormData();
      formData.append("file", blob, input.fileName);

      const res = await fetch(`${BE_BASE_URL}/api/external/upload/image`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error(res.statusText);
      return (await res.json()) as UploadResponse;
    }),

  /**
   * POST /api/external/upload/audio
   * Upload audio cho flashcard
   */
  uploadAudio: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        fileName: z.string().default("audio.mp3"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const BE_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";
      const headers: Record<string, string> = {};
      if (ctx.token) headers["Authorization"] = `Bearer ${ctx.token}`;

      const binary = Buffer.from(input.base64, "base64");
      const blob = new Blob([binary]);
      const formData = new FormData();
      formData.append("file", blob, input.fileName);

      const res = await fetch(`${BE_BASE_URL}/api/external/upload/audio`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error(res.statusText);
      return (await res.json()) as UploadResponse;
    }),

  /**
   * GET /api/external/wikipedia?query=...
   * Tóm tắt Wikipedia
   */
  wikipedia: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const params = new URLSearchParams({ query: input.query });
      return beGet<{ summary: string; url: string }>(`/api/external/wikipedia?${params}`, ctx.token);
    }),
} satisfies TRPCRouterRecord;
