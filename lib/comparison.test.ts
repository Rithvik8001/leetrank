import { describe, expect, test } from "bun:test";

import { comparisonUrl, difficultyDistribution, difficultyInsights } from "./comparison";
import { comparisonVisibilityFilter, normalizePublicHandle } from "./users/profiles";

describe("comparison analysis", () => {
  test("normalizes handles and creates shareable URLs", () => {
    expect(normalizePublicHandle(" Ada_01 ")).toBe("ada_01");
    expect(comparisonUrl("ada_01", "bob-2")).toBe("/compare?left=ada_01&right=bob-2");
  });

  test("calculates difficulty percentages and avoids zero division", () => {
    expect(difficultyDistribution({ total: 100, easy: 20, medium: 60, hard: 20 })).toEqual({ Easy: 20, Medium: 60, Hard: 20 });
    expect(difficultyDistribution({ total: 0, easy: 0, medium: 0, hard: 0 })).toBeNull();
  });

  test("identifies relative stronger and weaker difficulty shares", () => {
    const result = difficultyInsights(
      { Easy: 20, Medium: 50, Hard: 30 },
      { Easy: 40, Medium: 50, Hard: 10 },
    );
    expect(result.left).toEqual({ stronger: "Hard", weaker: "Easy" });
    expect(result.right).toEqual({ stronger: "Easy", weaker: "Hard" });
  });

  test("requires public visibility only for anonymous comparisons", () => {
    expect(comparisonVisibilityFilter(true)).toEqual({ leetcodeVerified: true, publicProfileEnabled: true });
    expect(comparisonVisibilityFilter(false)).toEqual({ leetcodeVerified: true });
  });
});
