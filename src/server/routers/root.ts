import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import superjson from "superjson";
import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const createContext = async () => {
  const session = await getServerSession(authOptions);
  return { session, prisma };
};

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

const isAdmin = middleware(({ ctx, next }) => {
  if (!ctx.session?.user || (ctx.session.user as any).role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

export const protectedProcedure = publicProcedure.use(isAuthed);
export const adminProcedure = publicProcedure.use(isAdmin);
