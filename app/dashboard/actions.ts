"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { syncVerifiedUserStats, type SyncResult } from "@/lib/leetcode-sync";
import { prisma } from "@/lib/prisma";
import { normalizePublicHandle } from "@/lib/users/profiles";
import { revalidatePath } from "next/cache";

export async function syncLeetCodeStats(): Promise<SyncResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, kind: "not_verified" as const, error: "Log in to refresh your stats." };
  }
  return syncVerifiedUserStats(session.user.id);
}

export async function setPublicProfileEnabled(enabled: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false as const, error: "Log in to change profile visibility." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { leetcodeVerified: true, leetcodeUsername: true, publicProfileHandle: true },
  });
  if (!user?.leetcodeVerified || !user.leetcodeUsername) {
    return { ok: false as const, error: "Verify a LeetCode account first." };
  }
  const handle = user.publicProfileHandle ?? normalizePublicHandle(user.leetcodeUsername);
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { publicProfileEnabled: enabled, publicProfileHandle: handle },
    });
  } catch {
    return { ok: false as const, error: "That public profile address is unavailable." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/u/${handle}`);
  return { ok: true as const, enabled, handle };
}
