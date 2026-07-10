import { prisma } from "@/lib/prisma";
import { utcDayStart } from "@/lib/leetcode-sync";
import { getUniversityRank } from "@/lib/users/profiles";
import {
  getEarliestSnapshot,
  getSnapshotAsOf,
  getUserSnapshots,
  type SnapshotPoint,
} from "@/lib/users/snapshots";
import type { RatingDelta } from "@/lib/marketing/placeholder-data";

export const WEEK_DAYS = 7;
export const MONTH_DAYS = 30;
export const CHART_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

// The UTC midnight `days` before `now` — aligns with the snapshot `capturedOn` bucket.
export function daysAgo(now: Date, days: number): Date {
  return new Date(utcDayStart(now).getTime() - days * DAY_MS);
}

export function toRatingDelta(delta: number | null): RatingDelta | null {
  if (delta == null) return null;
  return {
    value: Math.abs(delta),
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  };
}

export function pluralPlaces(n: number): string {
  return Math.abs(n) === 1 ? "place" : "places";
}

// The dashboard headline. Returns null for a flat/negative week so we never show
// a hollow "you solved 0 problems" line — the section just omits the insight.
export function buildInsight({
  weekSolved,
  rankMovement,
  hasUniversity,
}: {
  weekSolved: number | null;
  rankMovement: number | null;
  hasUniversity: boolean;
}): string | null {
  if (weekSolved == null || weekSolved <= 0) return null;
  const solved = `You solved ${weekSolved} problem${weekSolved === 1 ? "" : "s"} this week`;

  if (!hasUniversity || rankMovement == null) return `${solved}. Keep the streak going.`;
  if (rankMovement > 0) {
    return `${solved} and moved up ${rankMovement} ${pluralPlaces(rankMovement)} in your university.`;
  }
  if (rankMovement < 0) {
    const n = Math.abs(rankMovement);
    return `${solved}, though you slipped ${n} ${pluralPlaces(n)} in your university.`;
  }
  return `${solved} and held your position in your university.`;
}

export type ProgressMetric = {
  value: number | null;
  partial: boolean; // baseline is younger than the window — history doesn't reach back
  since: Date | null; // baseline date actually used when partial
};

export type PersonalProgress = {
  weekSolved: ProgressMetric;
  monthSolved: ProgressMetric;
  monthHard: ProgressMetric;
  ratingChange: RatingDelta | null; // over the month
  rank: { now: number | null; then: number | null; movement: number | null }; // week; movement > 0 = climbed
  chart: { capturedAt: string; totalSolved: number }[]; // last 30 days
  insight: string | null;
};

type ProgressUser = {
  id: string;
  universityId: string | null;
  leetcodeTotalSolved: number | null;
  leetcodeHardSolved: number | null;
  leetcodeContestRating: number | null;
};

function metric(
  current: number | null,
  baseline: SnapshotPoint | null,
  earliest: SnapshotPoint | null,
  field: "totalSolved" | "hardSolved",
): ProgressMetric {
  if (current == null) return { value: null, partial: false, since: null };
  const base = baseline ?? earliest;
  if (base == null) return { value: null, partial: false, since: null };
  return {
    value: current - base[field],
    partial: baseline == null,
    since: baseline == null ? base.capturedAt : null,
  };
}

// Rank the user's verified university peers by their `totalSolved` as of `cutoff`
// (each peer's latest snapshot on or before that day). Peers without a snapshot
// that old are absent — a reasonable approximation for a historical rank.
async function getCampusRankAsOf(
  universityId: string | null,
  userId: string,
  cutoff: Date,
): Promise<number | null> {
  if (!universityId) return null;
  const rows = await prisma.$queryRaw<{ userId: string; totalSolved: number }[]>`
    SELECT DISTINCT ON (s."userId") s."userId" AS "userId", s."totalSolved" AS "totalSolved"
    FROM "leetcode_snapshot" s
    JOIN "user" u ON u."id" = s."userId"
    WHERE u."universityId" = ${universityId}
      AND u."leetcodeVerified" = true
      AND s."capturedOn" <= ${cutoff}
    ORDER BY s."userId", s."capturedOn" DESC`;
  const mine = rows.find((row) => row.userId === userId);
  if (!mine) return null;
  const ahead = rows.filter((row) => row.totalSolved > mine.totalSolved).length;
  return ahead + 1;
}

export async function getPersonalProgress(
  user: ProgressUser,
  now = new Date(),
): Promise<PersonalProgress> {
  const weekCutoff = daysAgo(now, WEEK_DAYS);
  const monthCutoff = daysAgo(now, MONTH_DAYS);

  const [weekBase, monthBase, earliest, chartRows, rankNow, rankThen] = await Promise.all([
    getSnapshotAsOf(user.id, weekCutoff),
    getSnapshotAsOf(user.id, monthCutoff),
    getEarliestSnapshot(user.id),
    getUserSnapshots(user.id, { since: daysAgo(now, CHART_DAYS) }),
    getUniversityRank(user.universityId, user.leetcodeTotalSolved),
    getCampusRankAsOf(user.universityId, user.id, weekCutoff),
  ]);

  const weekSolved = metric(user.leetcodeTotalSolved, weekBase, earliest, "totalSolved");
  const monthSolved = metric(user.leetcodeTotalSolved, monthBase, earliest, "totalSolved");
  const monthHard = metric(user.leetcodeHardSolved, monthBase, earliest, "hardSolved");

  const ratingBaseline = monthBase ?? earliest;
  const ratingChange =
    ratingBaseline?.contestRating == null || user.leetcodeContestRating == null
      ? null
      : toRatingDelta(user.leetcodeContestRating - ratingBaseline.contestRating);

  const movement = rankThen != null && rankNow != null ? rankThen - rankNow : null;

  return {
    weekSolved,
    monthSolved,
    monthHard,
    ratingChange,
    rank: { now: rankNow, then: rankThen, movement },
    chart: chartRows.map((point) => ({
      capturedAt: point.capturedAt.toISOString(),
      totalSolved: point.totalSolved,
    })),
    insight: buildInsight({
      weekSolved: weekSolved.value,
      rankMovement: movement,
      hasUniversity: user.universityId != null,
    }),
  };
}
