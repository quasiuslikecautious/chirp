import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  byUserId: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You are not authorized',
      });
    };

    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    return user;
  }),
});
