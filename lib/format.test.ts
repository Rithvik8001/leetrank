import { describe, expect, test } from "bun:test";

import { formatRelativeTime } from "./format";

describe("formatRelativeTime", () => {
  const now = new Date("2026-07-10T12:00:00.000Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;

  test("under a minute reads 'just now'", () => {
    expect(formatRelativeTime(ago(30 * 1000), now)).toBe("just now");
  });

  test("minutes, hours, days, weeks", () => {
    expect(formatRelativeTime(ago(5 * MINUTE), now)).toBe("5 minutes ago");
    expect(formatRelativeTime(ago(3 * HOUR), now)).toBe("3 hours ago");
    expect(formatRelativeTime(ago(2 * DAY), now)).toBe("2 days ago");
    expect(formatRelativeTime(ago(2 * WEEK), now)).toBe("2 weeks ago");
  });

  test("uses the largest fitting unit", () => {
    expect(formatRelativeTime(ago(DAY), now)).toBe("yesterday");
  });

  test("future dates read as 'in …'", () => {
    expect(formatRelativeTime(new Date(now.getTime() + 2 * HOUR), now)).toBe("in 2 hours");
  });
});
