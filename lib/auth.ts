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
