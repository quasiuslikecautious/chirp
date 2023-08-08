import { createServerSideHelpers } from "@trpc/react-query/server";

import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root"; 

import superjson from "superjson";

import { getSession } from "next-auth/react";

export const generateSSGHelper = async () => createServerSideHelpers({
  router: appRouter,
  ctx: { 
    session: await getSession(), 
    prisma,
  },
  transformer: superjson,
});
