import { describe, expect, test } from "bun:test";
import { LeetcodeSyncStatus } from "@prisma/client";

import {
  profileStatsData,
  snapshotStatsData,
  STALE_PENDING_MS,
  SYNC_COOLDOWN_MS,
  syncAvailability,
  syncErrorMessage,
  utcDayStart,
} from "./leetcode-sync";
import { LeetCodeRateLimitedError, type LeetCodePublicProfile } from "./leetcode";

const now = new Date("2026-07-10T12:00:00.000Z");

describe("syncAvailability", () => {
  test("allows idle and expired cooldown states", () => {
    expect(syncAvailability(LeetcodeSyncStatus.IDLE, null, now)).toBe("available");
    expect(
      syncAvailability(
        LeetcodeSyncStatus.SUCCESS,
        new Date(now.getTime() - SYNC_COOLDOWN_MS),
        now,
      ),
    ).toBe("available");
  });

  test("enforces cooldown after success or failure", () => {
    const recent = new Date(now.getTime() - 60_000);
    expect(syncAvailability(LeetcodeSyncStatus.SUCCESS, recent, now)).toBe("cooldown");
    expect(syncAvailability(LeetcodeSyncStatus.FAILED, recent, now)).toBe("cooldown");
  });

  test("rejects active work and recovers abandoned pending work", () => {
    expect(
      syncAvailability(LeetcodeSyncStatus.PENDING, new Date(now.getTime() - 60_000), now),
    ).toBe("already_pending");
    expect(
      syncAvailability(
        LeetcodeSyncStatus.PENDING,
        new Date(now.getTime() - STALE_PENDING_MS),
        now,
      ),
    ).toBe("available");
  });
});

describe("sync snapshot helpers", () => {
  test("maps every normalized stat and optional value", () => {
    const profile: LeetCodePublicProfile = {
      username: "coder",
      aboutMe: "",
      ranking: null,
      totalSolved: 25,
      easySolved: 10,
      mediumSolved: 12,
      hardSolved: 3,
      contestRating: null,
      contestGlobalRanking: null,
      badges: [],
    };
    expect(profileStatsData(profile)).toMatchObject({
      leetcodeTotalSolved: 25,
      leetcodeEasySolved: 10,
      leetcodeMediumSolved: 12,
      leetcodeHardSolved: 3,
      leetcodeRanking: null,
      leetcodeContestRating: null,
      leetcodeContestGlobalRanking: null,
      leetcodeBadges: [],
    });
  });

  test("stores a sanitized rate-limit failure", () => {
    expect(syncErrorMessage(new LeetCodeRateLimitedError())).toBe(
      "LeetCode is limiting requests right now. Try again later.",
    );
    expect(syncErrorMessage(new Error("secret internal detail"))).not.toContain("secret");
  });
});

describe("daily snapshot helpers", () => {
  test("snapshotStatsData maps the six snapshot fields incl. null optionals", () => {
    const profile: LeetCodePublicProfile = {
      username: "coder",
      aboutMe: "",
      ranking: null,
      totalSolved: 25,
      easySolved: 10,
      mediumSolved: 12,
      hardSolved: 3,
      contestRating: null,
      contestGlobalRanking: null,
      badges: [],
    };
    expect(snapshotStatsData(profile)).toEqual({
      totalSolved: 25,
      easySolved: 10,
      mediumSolved: 12,
      hardSolved: 3,
      contestRating: null,
      ranking: null,
    });
  });

  test("utcDayStart truncates to midnight UTC", () => {
    expect(utcDayStart(new Date("2026-07-10T23:59:59.999Z")).toISOString()).toBe(
      "2026-07-10T00:00:00.000Z",
    );
  });

  test("utcDayStart buckets across a UTC day boundary into different days", () => {
    const lateNight = utcDayStart(new Date("2026-07-10T23:59:00.000Z")).getTime();
    const nextMorning = utcDayStart(new Date("2026-07-11T00:01:00.000Z")).getTime();
    expect(lateNight).not.toBe(nextMorning);
  });
});
