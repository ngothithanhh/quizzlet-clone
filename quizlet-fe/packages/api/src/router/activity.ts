import type { TRPCRouterRecord } from "@trpc/server";

import { beGet } from "../lib/beClient";
import { protectedProcedure } from "../trpc";

/** Activity hiện tại được quản lý bởi BE — router này chỉ là placeholder */
export const activityRouter = {
  create: protectedProcedure.mutation(async () => {
    // BE tự track activity khi user thao tác với study sets
    return { success: true };
  }),

  allByUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const page = await beGet<{ content: { startedAt: string }[] }>("/api/users/me/sessions?size=100", ctx.token);
      return page.content.map(s => ({ date: s.startedAt }));
    } catch {
      return [];
    }
  }),
} satisfies TRPCRouterRecord;
