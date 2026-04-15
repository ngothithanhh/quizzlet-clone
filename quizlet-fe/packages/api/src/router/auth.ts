import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../trpc";

export const authRouter = {
  getSecretMessage: publicProcedure.query(() => {
    return "you can see this secret message!";
  }),
} satisfies TRPCRouterRecord;
