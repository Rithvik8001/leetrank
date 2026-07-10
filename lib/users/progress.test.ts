import { describe, expect, test } from "bun:test";

import { buildInsight, daysAgo, toRatingDelta } from "./progress";

describe("buildInsight", () => {
  test("climbing the university ladder", () => {
    expect(buildInsight({ weekSolved: 18, rankMovement: 3, hasUniversity: true })).toBe(
      "You solved 18 problems this week and moved up 3 places in your university.",
    );
  });

  test("singular problem and place", () => {
    expect(buildInsight({ weekSolved: 1, rankMovement: 1, hasUniversity: true })).toBe(
      "You solved 1 problem this week and moved up 1 place in your university.",
    );
  });

  test("holding position", () => {
    expect(buildInsight({ weekSolved: 5, rankMovement: 0, hasUniversity: true })).toBe(
      "You solved 5 problems this week and held your position in your university.",
    );
  });

  test("slipping", () => {
    expect(buildInsight({ weekSolved: 5, rankMovement: -2, hasUniversity: true })).toBe(
      "You solved 5 problems this week, though you slipped 2 places in your university.",
    );
  });

  test("no university falls back to a streak nudge", () => {
    expect(buildInsight({ weekSolved: 5, rankMovement: null, hasUniversity: false })).toBe(
      "You solved 5 problems this week. Keep the streak going.",
    );
  });

  test("omits a hollow insight for a flat or empty week", () => {
    expect(buildInsight({ weekSolved: 0, rankMovement: 3, hasUniversity: true })).toBeNull();
    expect(buildInsight({ weekSolved: null, rankMovement: 3, hasUniversity: true })).toBeNull();
  });
});

describe("toRatingDelta", () => {
  test("maps sign to direction", () => {
    expect(toRatingDelta(24)).toEqual({ value: 24, direction: "up" });
    expect(toRatingDelta(-5)).toEqual({ value: 5, direction: "down" });
    expect(toRatingDelta(0)).toEqual({ value: 0, direction: "flat" });
    expect(toRatingDelta(null)).toBeNull();
  });
});

describe("daysAgo", () => {
  test("subtracts whole UTC days off the day bucket", () => {
    expect(daysAgo(new Date("2026-07-10T15:30:00.000Z"), 7).toISOString()).toBe(
      "2026-07-03T00:00:00.000Z",
    );
  });
});
