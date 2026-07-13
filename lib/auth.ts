import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Rate limiting persists to the shared `RateLimit` Prisma model so limits are
  // durable and shared across serverless instances (the default in-memory store
  // is per-instance and resets on cold start). `enabled: true` also covers dev.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 10,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/forget-password": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  user: {
    additionalFields: {
      universityId: { type: "string", required: false, input: false },
      onboardingCompletedAt: { type: "date", required: false, input: false },
      leetcodeUsername: { type: "string", required: false, input: false },
      leetcodeVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      leetcodeVerifiedAt: { type: "date", required: false, input: false },
      leetcodeTotalSolved: { type: "number", required: false, input: false },
      leetcodeRanking: { type: "number", required: false, input: false },
      leetcodeLastSyncedAt: { type: "date", required: false, input: false },
    },
  },
  // Must be last: propagates Better Auth's Set-Cookie headers from Server
  // Actions into Next.js, including forced cookie-cache refreshes.
  plugins: [nextCookies()],
});
