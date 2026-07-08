import { PrismaClient } from "@prisma/client";

// Cache the client across module reloads (Next.js dev HMR) so we don't
// exhaust the Supabase pooler's connection limit by reconnecting on every reload.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
