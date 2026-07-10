import { Prisma, LeetcodeSyncStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  fetchLeetCodePublicProfile,
  LeetCodeFetchError,
  LeetCodeProfileNotFoundError,
  LeetCodeRateLimitedError,
  type LeetCodePublicProfile,
} from "@/lib/leetcode";

export const SYNC_COOLDOWN_MS = 15 * 60 * 1000;
export const STALE_PENDING_MS = 5 * 60 * 1000;

export type SyncResult =
  | { ok: true; kind: "success" }
  | { ok: false; kind: "not_verified"; error: string }
  | { ok: false; kind: "cooldown"; error: string; retryAt: string }
  | { ok: false; kind: "already_pending"; error: string }
  | { ok: false; kind: "failed"; error: string };

export function syncAvailability(
  status: LeetcodeSyncStatus,
  lastAttemptAt: Date | null,
  now: Date,
): "available" | "cooldown" | "already_pending" {
  const cooldownCutoff = new Date(now.getTime() - SYNC_COOLDOWN_MS);
  const staleCutoff = new Date(now.getTime() - STALE_PENDING_MS);
  if (status === LeetcodeSyncStatus.PENDING) {
    return lastAttemptAt && lastAttemptAt > staleCutoff
      ? "already_pending"
      : "available";
  }
  return lastAttemptAt && lastAttemptAt > cooldownCutoff
    ? "cooldown"
    : "available";
}

export function profileStatsData(profile: LeetCodePublicProfile) {
  return {
    leetcodeTotalSolved: profile.totalSolved,
    leetcodeEasySolved: profile.easySolved,
    leetcodeMediumSolved: profile.mediumSolved,
    leetcodeHardSolved: profile.hardSolved,
    leetcodeRanking: profile.ranking,
    leetcodeContestRating: profile.contestRating,
    leetcodeContestGlobalRanking: profile.contestGlobalRanking,
    leetcodeBadges: profile.badges as unknown as Prisma.InputJsonValue,
  };
}

export function snapshotStatsData(profile: LeetCodePublicProfile) {
  return {
    totalSolved: profile.totalSolved,
    easySolved: profile.easySolved,
    mediumSolved: profile.mediumSolved,
    hardSolved: profile.hardSolved,
    contestRating: profile.contestRating,
    ranking: profile.ranking,
  };
}

export function utcDayStart(now: Date): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

// One snapshot per verified user per UTC day; latest sync of the day wins.
// Best-effort: callers must not let a snapshot failure regress a successful sync.
export async function recordDailySnapshot(
  userId: string,
  profile: LeetCodePublicProfile,
  now = new Date(),
) {
  const capturedOn = utcDayStart(now);
  const stats = snapshotStatsData(profile);
  await prisma.leetcodeSnapshot.upsert({
    where: { userId_capturedOn: { userId, capturedOn } },
    update: { capturedAt: now, ...stats },
    create: { id: crypto.randomUUID(), userId, capturedOn, capturedAt: now, ...stats },
  });
}

export function syncErrorMessage(error: unknown): string {
  if (error instanceof LeetCodeProfileNotFoundError) {
    return "We couldn't find your verified LeetCode profile.";
  }
  if (error instanceof LeetCodeRateLimitedError) {
    return "LeetCode is limiting requests right now. Try again later.";
  }
  if (error instanceof LeetCodeFetchError) return error.message.slice(0, 240);
  return "Stats couldn't be refreshed. Try again later.";
}

export async function syncVerifiedUserStats(
  userId: string,
  now = new Date(),
): Promise<SyncResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      leetcodeUsername: true,
      leetcodeVerified: true,
      leetcodeSyncStatus: true,
      leetcodeLastSyncAttemptAt: true,
    },
  });
  if (!user?.leetcodeVerified || !user.leetcodeUsername) {
    return { ok: false, kind: "not_verified", error: "Verify a LeetCode account first." };
  }

  const availability = syncAvailability(
    user.leetcodeSyncStatus,
    user.leetcodeLastSyncAttemptAt,
    now,
  );
  if (availability === "already_pending") {
    return { ok: false, kind: "already_pending", error: "A stats refresh is already running." };
  }
  if (availability === "cooldown") {
    return {
      ok: false,
      kind: "cooldown",
      error: "Stats can be refreshed once every 15 minutes.",
      retryAt: new Date(
        (user.leetcodeLastSyncAttemptAt?.getTime() ?? now.getTime()) +
          SYNC_COOLDOWN_MS,
      ).toISOString(),
    };
  }

  const cooldownCutoff = new Date(now.getTime() - SYNC_COOLDOWN_MS);
  const staleCutoff = new Date(now.getTime() - STALE_PENDING_MS);
  const claimed = await prisma.user.updateMany({
    where: {
      id: userId,
      leetcodeVerified: true,
      leetcodeUsername: { not: null },
      OR: [
        {
          leetcodeSyncStatus: LeetcodeSyncStatus.PENDING,
          leetcodeLastSyncAttemptAt: { lte: staleCutoff },
        },
        {
          leetcodeSyncStatus: { not: LeetcodeSyncStatus.PENDING },
          OR: [
            { leetcodeLastSyncAttemptAt: null },
            { leetcodeLastSyncAttemptAt: { lte: cooldownCutoff } },
          ],
        },
      ],
    },
    data: {
      leetcodeSyncStatus: LeetcodeSyncStatus.PENDING,
      leetcodeSyncError: null,
      leetcodeLastSyncAttemptAt: now,
    },
  });
  if (claimed.count === 0) {
    return { ok: false, kind: "already_pending", error: "A stats refresh is already running." };
  }

  try {
    const profile = await fetchLeetCodePublicProfile(user.leetcodeUsername);
    await prisma.user.updateMany({
      where: { id: userId, leetcodeLastSyncAttemptAt: now },
      data: {
        ...profileStatsData(profile),
        leetcodeSyncStatus: LeetcodeSyncStatus.SUCCESS,
        leetcodeSyncError: null,
        leetcodeLastSyncedAt: new Date(),
      },
    });
    try {
      await recordDailySnapshot(userId, profile, now);
    } catch (snapshotError) {
      console.warn(`Daily snapshot failed for user ${userId}:`, snapshotError);
    }
    return { ok: true, kind: "success" };
  } catch (error) {
    const message = syncErrorMessage(error);
    await prisma.user.updateMany({
      where: { id: userId, leetcodeLastSyncAttemptAt: now },
      data: { leetcodeSyncStatus: LeetcodeSyncStatus.FAILED, leetcodeSyncError: message },
    });
    return { ok: false, kind: "failed", error: message };
  }
}

// Batch sync for the daily cron. Sequential + paced to respect LeetCode's
// unofficial GraphQL endpoint; a per-user failure never aborts the batch.
export async function syncAllVerifiedUsers(now = new Date()) {
  const users = await prisma.user.findMany({
    where: { leetcodeVerified: true, leetcodeUsername: { not: null } },
    select: { id: true },
  });

  let ok = 0;
  let failed = 0;
  for (const user of users) {
    const result = await syncVerifiedUserStats(user.id, now);
    if (result.ok) {
      ok += 1;
    } else {
      failed += 1;
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  return { total: users.length, ok, failed };
}
