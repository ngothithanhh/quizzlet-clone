import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beGet, bePut } from "../lib/beClient";
import { protectedProcedure } from "../trpc";

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  link?: string;
  type?: string;
}

export const notificationRouter = {
  /** GET /api/notifications */
  all: protectedProcedure.query(async ({ ctx }) => {
    const data = await beGet<Array<NotificationResponse & { content?: string }>>(
      "/api/notifications",
      ctx.token,
    );

    return (data ?? []).map((item) => ({
      ...item,
      // Backend field is `content`; UI currently reads `message`.
      message: item.message ?? item.content ?? "",
    }));
  }),

  /** GET /api/notifications/unread-count */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const data = await beGet<{ count: number } | number>("/api/notifications/unread-count", ctx.token);
    // BE có thể trả về số hoặc object { count: number }
    if (typeof data === "number") return data;
    return (data as any)?.count ?? 0;
  }),

  /** PUT /api/notifications/{id}/read */
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePut<void>(`/api/notifications/${input.id}/read`, undefined, ctx.token);
    }),

  /** PUT /api/notifications/read-all */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    return bePut<void>("/api/notifications/read-all", undefined, ctx.token);
  }),
} satisfies TRPCRouterRecord;
