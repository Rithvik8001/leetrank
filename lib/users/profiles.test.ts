import { describe, expect, test } from "bun:test";

import { competitionRank, normalizePublicHandle, parseLeetCodeBadges } from "./profiles";

describe("public profiles", () => {
  test("normalizes verified handles for stable URLs", () => {
    expect(normalizePublicHandle("  Campus_Coder-7 ")).toBe("campus_coder-7");
  });

  test("keeps only safe badge snapshots", () => {
    expect(parseLeetCodeBadges([
      { id: "1", name: "Knight", iconUrl: null, earnedAt: null },
      { id: 2, name: "invalid" },
      null,
    ])).toEqual([{ id: "1", name: "Knight", iconUrl: null, earnedAt: null }]);
  });
});

describe("competition ranking", () => {
  test("ranks after the number of students strictly ahead", () => {
    expect(competitionRank(0, 800)).toBe(1);
    expect(competitionRank(1, 700)).toBe(2);
    expect(competitionRank(3, 700)).toBe(4);
  });

  test("does not rank a missing solved snapshot", () => {
    expect(competitionRank(0, null)).toBeNull();
  });
});
