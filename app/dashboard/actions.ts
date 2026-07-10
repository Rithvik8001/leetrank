"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { syncVerifiedUserStats, type SyncResult } from "@/lib/leetcode-sync";

export async function syncLeetCodeStats(): Promise<SyncResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, kind: "not_verified" as const, error: "Log in to refresh your stats." };
  }
  return syncVerifiedUserStats(session.user.id);
}
