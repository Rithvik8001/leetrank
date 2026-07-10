import { prisma } from "@/lib/prisma";
import type { LeaderboardUser } from "@/lib/leaderboard";
import { WEEK_DAYS, daysAgo } from "@/lib/users/progress";

export const INSIGHT_LIMIT = 5;

export type InsightEntry = {
  id: string;
  name: string;
  username: string | null;
  profileHref: string | null;
  value: number;
};

export type UniversityInsights = {
  totalVerified: number;
  averageSolved: number | null;
  averageRating: number | null;
  activeThisWeek: number;
  mostImproved: InsightEntry[]; // value = places climbed in campus rank this week
  mostActive: InsightEntry[]; // value = problems solved this week
  topHardSolvers: InsightEntry[]; // value = hard problems solved (all-time)
};

// Each verified peer's latest `totalSolved` on or before `cutoff` — one row per
// user. Same DISTINCT ON pattern as getCampusRankAsOf, but for the whole campus.
async function getUniversitySolvedAsOf(
  universityId: string,
  cutoff: Date,
): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ userId: string; totalSolved: number }[]>`
    SELECT DISTINCT ON (s."userId") s."userId" AS "userId", s."totalSolved" AS "totalSolved"
    FROM "leetcode_snapshot" s
    JOIN "user" u ON u."id" = s."userId"
    WHERE u."universityId" = ${universityId}
      AND u."leetcodeVerified" = true
      AND s."capturedOn" <= ${cutoff}
    ORDER BY s."userId", s."capturedOn" DESC`;
  return new Map(rows.map((row) => [row.userId, row.totalSolved]));
}

// Mean of the non-null values, or null when there are none. Rounding is left to
// the caller so tests can assert the raw mean.
export function averageOf(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value != null);
  if (!present.length) return null;
  return present.reduce((sum, value) => sum + value, 0) / present.length;
}

// Problems solved this week: current total minus the week-ago baseline. Null
// when the user has no snapshot reaching back the window.
export function weeklyDelta(
  user: LeaderboardUser,
  asOf: Map<string, number>,
): number | null {
  const baseline = asOf.get(user.id);
  if (baseline == null || user.leetcodeTotalSolved == null) return null;
  return user.leetcodeTotalSolved - baseline;
}

function profileHref(user: LeaderboardUser): string | null {
  return user.publicProfileEnabled && user.publicProfileHandle
    ? `/u/${user.publicProfileHandle}`
    : null;
}

function toEntry(user: LeaderboardUser, value: number): InsightEntry {
  return {
    id: user.id,
    name: user.name,
    username: user.leetcodeUsername,
    profileHref: profileHref(user),
    value,
  };
}

// Verified users who solved the most problems this week (positive delta only),
// highest first. Ties break by name for deterministic output.
export function rankMostActive(
  users: LeaderboardUser[],
  asOf: Map<string, number>,
  limit = INSIGHT_LIMIT,
): InsightEntry[] {
  return users
    .map((user) => ({ user, delta: weeklyDelta(user, asOf) }))
    .filter((row): row is { user: LeaderboardUser; delta: number } => row.delta != null && row.delta > 0)
    .sort((a, b) => b.delta - a.delta || a.user.name.localeCompare(b.user.name))
    .slice(0, limit)
    .map(({ user, delta }) => toEntry(user, delta));
}

// Verified users who climbed the most campus-rank places this week. rankNow is
// taken over the current pool, rankThen over the as-of pool — the same
// approximation getPersonalProgress uses. Only climbers (movement > 0) qualify.
export function rankMostImproved(
  users: LeaderboardUser[],
  asOf: Map<string, number>,
  limit = INSIGHT_LIMIT,
): InsightEntry[] {
  const currentTotals = users
    .map((user) => user.leetcodeTotalSolved)
    .filter((value): value is number => value != null);
  const baselineTotals = [...asOf.values()];

  return users
    .map((user) => {
      const baseline = asOf.get(user.id);
      if (baseline == null || user.leetcodeTotalSolved == null) return null;
      const rankNow = 1 + currentTotals.filter((total) => total > user.leetcodeTotalSolved!).length;
      const rankThen = 1 + baselineTotals.filter((total) => total > baseline).length;
      const movement = rankThen - rankNow;
      return movement > 0 ? { user, movement } : null;
    })
    .filter((row): row is { user: LeaderboardUser; movement: number } => row != null)
    .sort((a, b) => b.movement - a.movement || a.user.name.localeCompare(b.user.name))
    .slice(0, limit)
    .map(({ user, movement }) => toEntry(user, movement));
}

// Highest all-time hard-problem counts. This is a current standing, not weekly.
export function topHardSolvers(
  users: LeaderboardUser[],
  limit = INSIGHT_LIMIT,
): InsightEntry[] {
  return users
    .filter((user): user is LeaderboardUser & { leetcodeHardSolved: number } =>
      user.leetcodeHardSolved != null && user.leetcodeHardSolved > 0,
    )
    .sort((a, b) => b.leetcodeHardSolved - a.leetcodeHardSolved || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((user) => toEntry(user, user.leetcodeHardSolved));
}

export function countActiveThisWeek(
  users: LeaderboardUser[],
  asOf: Map<string, number>,
): number {
  return users.reduce((count, user) => {
    const delta = weeklyDelta(user, asOf);
    return delta != null && delta > 0 ? count + 1 : count;
  }, 0);
}

export async function getUniversityInsights(
  universityId: string,
  users: LeaderboardUser[], // the verified-user list the page already fetched
  now = new Date(),
): Promise<UniversityInsights> {
  const asOf = await getUniversitySolvedAsOf(universityId, daysAgo(now, WEEK_DAYS));

  const averageSolved = averageOf(users.map((user) => user.leetcodeTotalSolved));
  const averageRating = averageOf(users.map((user) => user.leetcodeContestRating));

  return {
    totalVerified: users.length,
    averageSolved: averageSolved == null ? null : Math.round(averageSolved),
    averageRating: averageRating == null ? null : Math.round(averageRating),
    activeThisWeek: countActiveThisWeek(users, asOf),
    mostImproved: rankMostImproved(users, asOf),
    mostActive: rankMostActive(users, asOf),
    topHardSolvers: topHardSolvers(users),
  };
}
