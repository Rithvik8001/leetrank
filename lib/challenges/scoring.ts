import type { ChallengeBaselineKind } from "@prisma/client";

import type { ChallengeMetricValue } from "@/lib/challenges/constants";

export type ChallengeMetricStats = {
  totalSolved: number | null;
  hardSolved: number | null;
  contestRating: number | null;
};

export type ChallengeStandingInput = {
  id: string;
  userId: string;
  name: string;
  username: string | null;
  profileHref: string | null;
  joinedAt: Date;
  baselineKind: ChallengeBaselineKind;
  baselineValue: number | null;
  currentValue: number | null;
  delta: number | null;
  finalized: boolean;
};

export type ChallengeStanding = ChallengeStandingInput & {
  rank: number | null;
};

export function metricValue(
  stats: ChallengeMetricStats,
  metric: ChallengeMetricValue,
): number | null {
  if (metric === "TOTAL_SOLVED") return stats.totalSolved;
  if (metric === "HARD_SOLVED") return stats.hardSolved;
  return stats.contestRating;
}

export function challengeDelta(
  current: ChallengeMetricStats,
  baseline: ChallengeMetricStats,
  metric: ChallengeMetricValue,
): number | null {
  const currentValue = metricValue(current, metric);
  const baselineValue = metricValue(baseline, metric);
  return currentValue == null || baselineValue == null ? null : currentValue - baselineValue;
}

function compareNullableDesc(a: number | null, b: number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return b - a;
}

export function rankChallengeStandings(rows: ChallengeStandingInput[]): ChallengeStanding[] {
  const sorted = [...rows].sort(
    (a, b) =>
      compareNullableDesc(a.delta, b.delta) ||
      compareNullableDesc(a.currentValue, b.currentValue) ||
      a.name.localeCompare(b.name) ||
      a.userId.localeCompare(b.userId),
  );

  let previousDelta: number | null | undefined;
  let previousRank: number | null = null;
  return sorted.map((row, index) => {
    const rank =
      row.delta == null
        ? null
        : row.delta === previousDelta
          ? previousRank
          : index + 1;
    if (row.delta != null) {
      previousDelta = row.delta;
      previousRank = rank;
    }
    return { ...row, rank };
  });
}
