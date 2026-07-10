import { describe, expect, test } from "bun:test";

import type { LeaderboardUser } from "@/lib/leaderboard";
import {
  averageOf,
  countActiveThisWeek,
  rankMostActive,
  rankMostImproved,
  topHardSolvers,
  weeklyDelta,
} from "./insights";

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

describe("averageOf", () => {
  test("means the non-null values", () => {
    expect(averageOf([10, 20, 30])).toBe(20);
  });

  test("ignores nulls", () => {
    expect(averageOf([10, null, 30])).toBe(20);
  });

  test("returns null when there is nothing to average", () => {
    expect(averageOf([])).toBeNull();
    expect(averageOf([null, null])).toBeNull();
  });
});

describe("weeklyDelta", () => {
  test("current total minus the week-ago baseline", () => {
    const asOf = new Map([["a", 40]]);
    expect(weeklyDelta(user("a", { leetcodeTotalSolved: 55 }), asOf)).toBe(15);
  });

  test("null without a baseline or a current total", () => {
    expect(weeklyDelta(user("a", { leetcodeTotalSolved: 55 }), new Map())).toBeNull();
    expect(weeklyDelta(user("a"), new Map([["a", 40]]))).toBeNull();
  });
});

describe("rankMostActive", () => {
  test("orders by weekly delta, drops non-positive, respects limit", () => {
    const users = [
      user("a", { leetcodeTotalSolved: 50 }), // +10
      user("b", { leetcodeTotalSolved: 70 }), // +30
      user("c", { leetcodeTotalSolved: 20 }), // +0, dropped
      user("d", { leetcodeTotalSolved: 100 }), // no baseline, dropped
    ];
    const asOf = new Map([
      ["a", 40],
      ["b", 40],
      ["c", 20],
    ]);
    expect(rankMostActive(users, asOf, 5).map((entry) => [entry.id, entry.value])).toEqual([
      ["b", 30],
      ["a", 10],
    ]);
  });

  test("breaks ties by name", () => {
    const users = [
      user("zed", { name: "Zed", leetcodeTotalSolved: 50 }),
      user("ada", { name: "Ada", leetcodeTotalSolved: 50 }),
    ];
    const asOf = new Map([
      ["zed", 40],
      ["ada", 40],
    ]);
    expect(rankMostActive(users, asOf, 5).map((entry) => entry.id)).toEqual(["ada", "zed"]);
  });
});

describe("rankMostImproved", () => {
  test("ranks by campus-rank places climbed, drops non-climbers", () => {
    // Baselines: c=100 (#1), b=60 (#2), a=30 (#3).
    // Now: a=90, b=65, c=101 → a #2, c #1, b #3.
    // a: rankThen 3 → rankNow 2 = +1. c: 1 → 1 = 0 (dropped). b: 2 → 3 = -1 (dropped).
    const users = [
      user("a", { leetcodeTotalSolved: 90 }),
      user("b", { leetcodeTotalSolved: 65 }),
      user("c", { leetcodeTotalSolved: 101 }),
    ];
    const asOf = new Map([
      ["a", 30],
      ["b", 60],
      ["c", 100],
    ]);
    expect(rankMostImproved(users, asOf, 5).map((entry) => [entry.id, entry.value])).toEqual([
      ["a", 1],
    ]);
  });

  test("skips users without a baseline", () => {
    const users = [user("a", { leetcodeTotalSolved: 90 })];
    expect(rankMostImproved(users, new Map(), 5)).toEqual([]);
  });
});

describe("topHardSolvers", () => {
  test("orders by hard solved and drops zero/null", () => {
    const users = [
      user("a", { leetcodeHardSolved: 12 }),
      user("b", { leetcodeHardSolved: 30 }),
      user("c", { leetcodeHardSolved: 0 }),
      user("d"),
    ];
    expect(topHardSolvers(users, 5).map((entry) => [entry.id, entry.value])).toEqual([
      ["b", 30],
      ["a", 12],
    ]);
  });
});

describe("countActiveThisWeek", () => {
  test("counts users with a positive weekly delta", () => {
    const users = [
      user("a", { leetcodeTotalSolved: 50 }), // +10
      user("b", { leetcodeTotalSolved: 40 }), // +0
      user("c", { leetcodeTotalSolved: 100 }), // no baseline
    ];
    const asOf = new Map([
      ["a", 40],
      ["b", 40],
    ]);
    expect(countActiveThisWeek(users, asOf)).toBe(1);
  });
});
