import { describe, expect, test } from "bun:test";

import { challengeDates, challengeFormSchema } from "./schemas";

const valid = {
  title: "July Hard Sprint",
  description: "Push hard problems before regionals.",
  metric: "HARD_SOLVED" as const,
  startsOn: "2026-07-12",
  endsOn: "2026-08-10",
};

describe("challengeFormSchema", () => {
  test("accepts and trims a normal challenge", () => {
    const result = challengeFormSchema.safeParse({
      ...valid,
      title: "  100 Problems Prep  ",
      description: "  Thirty day push  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("100 Problems Prep");
      expect(result.data.description).toBe("Thirty day push");
    }
  });

  test("rejects invalid metrics", () => {
    expect(
      challengeFormSchema.safeParse({ ...valid, metric: "EASY_SOLVED" }).success,
    ).toBe(false);
  });

  test("rejects invalid date strings", () => {
    expect(
      challengeFormSchema.safeParse({ ...valid, startsOn: "2026-99-99" }).success,
    ).toBe(false);
  });

  test("rejects an end date before the start date", () => {
    expect(
      challengeFormSchema.safeParse({
        ...valid,
        startsOn: "2026-07-20",
        endsOn: "2026-07-19",
      }).success,
    ).toBe(false);
  });

  test("rejects durations over 90 days", () => {
    expect(
      challengeFormSchema.safeParse({
        ...valid,
        startsOn: "2026-07-01",
        endsOn: "2026-09-30",
      }).success,
    ).toBe(false);
  });

  test("converts valid date inputs to UTC day dates", () => {
    const result = challengeFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(challengeDates(result.data).startsOn.toISOString()).toBe(
        "2026-07-12T00:00:00.000Z",
      );
    }
  });
});
