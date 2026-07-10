import { describe, expect, test } from "bun:test";

import {
  crossedMilestone,
  deriveEvents,
  joinEvent,
  RATING_MILESTONES,
  SOLVED_MILESTONES,
  type ActivityActor,
  type SnapshotStep,
} from "./feed";

const actor: ActivityActor = { id: "u1", name: "Ada", username: "ada", profileHref: null };

function step(day: string, totalSolved: number, contestRating: number | null = null): SnapshotStep {
  return { at: new Date(`2026-07-${day}T06:00:00.000Z`), totalSolved, contestRating };
}

describe("crossedMilestone", () => {
  test("returns the crossed threshold", () => {
    expect(crossedMilestone(96, 104, SOLVED_MILESTONES)).toBe(100);
  });

  test("null when no threshold is crossed", () => {
    expect(crossedMilestone(101, 110, SOLVED_MILESTONES)).toBeNull();
    expect(crossedMilestone(100, 100, SOLVED_MILESTONES)).toBeNull();
  });

  test("picks the highest when several are crossed", () => {
    expect(crossedMilestone(1390, 1610, RATING_MILESTONES)).toBe(1600);
  });

  test("upper bound is inclusive, lower bound exclusive", () => {
    expect(crossedMilestone(50, 100, SOLVED_MILESTONES)).toBe(100); // 50 already had, 100 reached
    expect(crossedMilestone(49, 50, SOLVED_MILESTONES)).toBe(50);
  });
});

describe("deriveEvents", () => {
  test("emits a solved event only for notable jumps", () => {
    const events = deriveEvents(actor, [step("01", 60), step("02", 63), step("03", 70)]);
    expect(events.map((e) => [e.type, e.value])).toEqual([["solved", 7]]);
  });

  test("milestone supersedes the plain solved event that day", () => {
    const events = deriveEvents(actor, [step("01", 96), step("02", 108)]);
    expect(events.map((e) => [e.type, e.value])).toEqual([["milestone-solved", 100]]);
  });

  test("emits a rating gain, and a rating milestone when crossed", () => {
    expect(
      deriveEvents(actor, [step("01", 60, 1520), step("02", 60, 1545)]).map((e) => [e.type, e.value]),
    ).toEqual([["rating", 25]]);
    expect(
      deriveEvents(actor, [step("01", 60, 1580), step("02", 60, 1620)]).map((e) => [e.type, e.value]),
    ).toEqual([["milestone-rating", 1600]]);
  });

  test("no rating event on flat or dropped rating, or missing rating", () => {
    expect(deriveEvents(actor, [step("01", 60, 1600), step("02", 60, 1600)])).toEqual([]);
    expect(deriveEvents(actor, [step("01", 60, 1600), step("02", 60, 1580)])).toEqual([]);
    expect(deriveEvents(actor, [step("01", 60, null), step("02", 60, 1600)])).toEqual([]);
  });

  test("a single day can emit both a solved and a rating event", () => {
    const events = deriveEvents(actor, [step("01", 60, 1520), step("02", 68, 1540)]);
    expect(events.map((e) => e.type).sort()).toEqual(["rating", "solved"]);
  });

  test("no events for a series shorter than two points", () => {
    expect(deriveEvents(actor, [step("01", 60)])).toEqual([]);
    expect(deriveEvents(actor, [])).toEqual([]);
  });
});

describe("joinEvent", () => {
  const since = new Date("2026-07-01T00:00:00.000Z");

  test("emits when verified within the window", () => {
    const event = joinEvent(actor, new Date("2026-07-05T12:00:00.000Z"), since);
    expect(event?.type).toBe("joined");
  });

  test("null when verified before the window or never", () => {
    expect(joinEvent(actor, new Date("2026-06-20T00:00:00.000Z"), since)).toBeNull();
    expect(joinEvent(actor, null, since)).toBeNull();
  });
});
