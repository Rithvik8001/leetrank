import { describe, expect, test } from "bun:test";

import {
  competitionRank,
  normalizeProfileSearchQuery,
  normalizePublicHandle,
  parseLeetCodeBadges,
  toProfileSuggestion,
} from "./profiles";

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

describe("profile suggestions", () => {
  test("normalizes and caps search queries", () => {
    expect(normalizeProfileSearchQuery("  Campus_Coder-7 ")).toBe("campus_coder-7");
    expect(normalizeProfileSearchQuery("A".repeat(80))).toHaveLength(50);
  });

  test("projects only the public suggestion fields", () => {
    expect(toProfileSuggestion({
      name: "Ada Lovelace",
      leetcodeUsername: "Ada_01",
      publicProfileHandle: "ada_01",
      university: { name: "Example University" },
    })).toEqual({
      handle: "ada_01",
      leetcodeUsername: "Ada_01",
      name: "Ada Lovelace",
      universityName: "Example University",
    });
  });

  test("rejects profiles without a canonical username and handle", () => {
    expect(toProfileSuggestion({
      name: "Unlinked",
      leetcodeUsername: null,
      publicProfileHandle: null,
      university: null,
    })).toBeNull();
  });
});
