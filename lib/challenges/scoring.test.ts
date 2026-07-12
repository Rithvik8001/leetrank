import { ChallengeBaselineKind } from "@prisma/client";
import { describe, expect, test } from "bun:test";

import {
  challengeDelta,
  metricValue,
  rankChallengeStandings,
  type ChallengeStandingInput,
} from "./scoring";

const joinedAt = new Date("2026-07-12T12:00:00.000Z");

function row(
  id: string,
  values: Partial<ChallengeStandingInput> = {},
): ChallengeStandingInput {
  return {
    id,
    userId: id,
    name: id,
    username: id,
    profileHref: null,
    joinedAt,
    baselineKind: ChallengeBaselineKind.START_SNAPSHOT,
    baselineValue: 100,
    currentValue: 100,
    delta: 0,
    finalized: false,
    ...values,
  };
}

describe("challenge scoring", () => {
  test("reads the selected metric", () => {
    const stats = { totalSolved: 120, hardSolved: 12, contestRating: 1650 };
    expect(metricValue(stats, "TOTAL_SOLVED")).toBe(120);
    expect(metricValue(stats, "HARD_SOLVED")).toBe(12);
    expect(metricValue(stats, "CONTEST_RATING")).toBe(1650);
  });

  test("computes deltas for solved, hard, and rating metrics", () => {
    const current = { totalSolved: 140, hardSolved: 17, contestRating: 1712.4 };
    const baseline = { totalSolved: 100, hardSolved: 9, contestRating: 1650.2 };
    expect(challengeDelta(current, baseline, "TOTAL_SOLVED")).toBe(40);
    expect(challengeDelta(current, baseline, "HARD_SOLVED")).toBe(8);
    expect(challengeDelta(current, baseline, "CONTEST_RATING")).toBeCloseTo(62.2);
  });

  test("returns null when the baseline is missing", () => {
    expect(
      challengeDelta(
        { totalSolved: 140, hardSolved: 17, contestRating: 1712 },
        { totalSolved: null, hardSolved: 9, contestRating: 1650 },
        "TOTAL_SOLVED",
      ),
    ).toBeNull();
  });

  test("ranks by delta with competition ranks and deterministic ties", () => {
    const ranked = rankChallengeStandings([
      row("c", { name: "Cy", delta: 10 }),
      row("a", { name: "Ada", delta: 15 }),
      row("b", { name: "Ben", delta: 15 }),
      row("z", { name: "Zoe", delta: null }),
    ]);
    expect(ranked.map(({ id, rank }) => [id, rank])).toEqual([
      ["a", 1],
      ["b", 1],
      ["c", 3],
      ["z", null],
    ]);
  });

  test("keeps finalized rows on their frozen values", () => {
    const ranked = rankChallengeStandings([
      row("frozen", { currentValue: 130, delta: 30, finalized: true }),
      row("live", { currentValue: 180, delta: 80 }),
    ]);
    expect(ranked.map(({ id }) => id)).toEqual(["live", "frozen"]);
    expect(ranked.find((item) => item.id === "frozen")?.delta).toBe(30);
  });

  test("supports partial late-join fallback baselines", () => {
    const ranked = rankChallengeStandings([
      row("partial", {
        baselineKind: ChallengeBaselineKind.JOIN_FALLBACK,
        baselineValue: 90,
        currentValue: 110,
        delta: 20,
      }),
    ]);
    expect(ranked[0].baselineKind).toBe(ChallengeBaselineKind.JOIN_FALLBACK);
    expect(ranked[0].rank).toBe(1);
  });
});
