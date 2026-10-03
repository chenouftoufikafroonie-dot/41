import { initTRPC, TRPCError } from '@trpc/server';
import { db } from '@sasu-manager/db';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  return {
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
