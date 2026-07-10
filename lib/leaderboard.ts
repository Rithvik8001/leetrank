export const LEADERBOARD_SORTS = [
  { value: "contest-rating", label: "Contest rating" },
  { value: "total-solved", label: "Total solved" },
  { value: "hard-solved", label: "Hard solved" },
  { value: "global-ranking", label: "Global ranking" },
] as const;

export type LeaderboardSort = (typeof LEADERBOARD_SORTS)[number]["value"];
export const VERIFIED_LEADERBOARD_FILTER = { leetcodeVerified: true } as const;

export type LeaderboardUser = {
  id: string;
  name: string;
  leetcodeUsername: string | null;
  leetcodeTotalSolved: number | null;
  leetcodeEasySolved: number | null;
  leetcodeMediumSolved: number | null;
  leetcodeHardSolved: number | null;
  leetcodeRanking: number | null;
  leetcodeContestRating: number | null;
  leetcodeLastSyncedAt: Date | null;
  publicProfileEnabled: boolean;
  publicProfileHandle: string | null;
};

export function parseLeaderboardSort(value: string | undefined): LeaderboardSort {
  return LEADERBOARD_SORTS.some((sort) => sort.value === value)
    ? (value as LeaderboardSort)
    : "contest-rating";
}

export function leaderboardMetric(user: LeaderboardUser, sort: LeaderboardSort) {
  if (sort === "total-solved") return user.leetcodeTotalSolved;
  if (sort === "hard-solved") return user.leetcodeHardSolved;
  if (sort === "global-ranking") return user.leetcodeRanking;
  return user.leetcodeContestRating;
}

function compareNullable(a: number | null, b: number | null, direction: "asc" | "desc") {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === "asc" ? a - b : b - a;
}

export function rankLeaderboard(users: LeaderboardUser[], sort: LeaderboardSort) {
  const direction = sort === "global-ranking" ? "asc" : "desc";
  const sorted = [...users].sort((a, b) =>
    compareNullable(leaderboardMetric(a, sort), leaderboardMetric(b, sort), direction) ||
    compareNullable(a.leetcodeTotalSolved, b.leetcodeTotalSolved, "desc") ||
    compareNullable(a.leetcodeRanking, b.leetcodeRanking, "asc") ||
    a.name.localeCompare(b.name) ||
    a.id.localeCompare(b.id),
  );

  let previous: number | null | undefined;
  let previousRank: number | null = null;
  return sorted.map((user, index) => {
    const metric = leaderboardMetric(user, sort);
    const rank = metric == null
      ? null
      : metric === previous
        ? previousRank
        : index + 1;
    if (metric != null) {
      previous = metric;
      previousRank = rank;
    }
    return { ...user, rank };
  });
}
