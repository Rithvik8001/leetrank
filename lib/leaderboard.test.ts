import { describe, expect, test } from "bun:test";

import {
  parseLeaderboardSort,
  rankLeaderboard,
  VERIFIED_LEADERBOARD_FILTER,
  type LeaderboardUser,
} from "./leaderboard";

function user(id: string, values: Partial<LeaderboardUser> = {}): LeaderboardUser {
  return {
    id,
    name: id,
    leetcodeUsername: id,
    leetcodeTotalSolved: null,
    leetcodeEasySolved: null,
    leetcodeMediumSolved: null,
    leetcodeHardSolved: null,
    leetcodeRanking: null,
    leetcodeContestRating: null,
    leetcodeLastSyncedAt: null,
    publicProfileEnabled: false,
    publicProfileHandle: null,
    ...values,
  };
}

describe("leaderboard sorting", () => {
  test("defaults unknown sorts to contest rating", () => {
    expect(parseLeaderboardSort(undefined)).toBe("contest-rating");
    expect(parseLeaderboardSort("recent-improvement")).toBe("contest-rating");
  });

  test("sorts all metrics in the required direction with nulls last", () => {
    const rows = [
      user("a", { leetcodeContestRating: 1500, leetcodeTotalSolved: 50, leetcodeHardSolved: 5, leetcodeRanking: 200 }),
      user("b", { leetcodeContestRating: 1700, leetcodeTotalSolved: 40, leetcodeHardSolved: 9, leetcodeRanking: 100 }),
      user("c"),
    ];
    expect(rankLeaderboard(rows, "contest-rating").map((row) => row.id)).toEqual(["b", "a", "c"]);
    expect(rankLeaderboard(rows, "total-solved").map((row) => row.id)).toEqual(["a", "b", "c"]);
    expect(rankLeaderboard(rows, "hard-solved").map((row) => row.id)).toEqual(["b", "a", "c"]);
    expect(rankLeaderboard(rows, "global-ranking").map((row) => row.id)).toEqual(["b", "a", "c"]);
  });

  test("uses competition ranks for ties and deterministic secondary ordering", () => {
    const rows = [
      user("z", { name: "Zed", leetcodeContestRating: 1600, leetcodeTotalSolved: 10 }),
      user("a", { name: "Ada", leetcodeContestRating: 1600, leetcodeTotalSolved: 20 }),
      user("m", { leetcodeContestRating: 1500 }),
    ];
    const ranked = rankLeaderboard(rows, "contest-rating");
    expect(ranked.map(({ id, rank }) => [id, rank])).toEqual([["a", 1], ["z", 1], ["m", 3]]);
  });

  test("official standings require verification", () => {
    expect(VERIFIED_LEADERBOARD_FILTER).toEqual({ leetcodeVerified: true });
  });
});
