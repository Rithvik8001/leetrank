import { describe, expect, test } from "bun:test";

import {
  fetchLeetCodePublicProfile,
  LeetCodeFetchError,
  LeetCodeProfileNotFoundError,
  LeetCodeRateLimitedError,
  normalizeLeetCodeResponse,
} from "./leetcode";

const complete = {
  data: {
    matchedUser: {
      username: "coder",
      profile: { ranking: 1234, aboutMe: "hello" },
      submitStatsGlobal: {
        acSubmissionNum: [
          { difficulty: "All", count: 100 },
          { difficulty: "Easy", count: 40 },
          { difficulty: "Medium", count: 50 },
          { difficulty: "Hard", count: 10 },
        ],
      },
      badges: [
        { id: "1", displayName: "Annual Badge", icon: "/badge.png", creationDate: "2026-01-02" },
      ],
    },
    userContestRanking: { rating: 1742.8, globalRanking: 9001 },
  },
};

describe("normalizeLeetCodeResponse", () => {
  test("normalizes a complete profile", () => {
    expect(normalizeLeetCodeResponse(complete, "coder")).toEqual({
      username: "coder",
      aboutMe: "hello",
      ranking: 1234,
      totalSolved: 100,
      easySolved: 40,
      mediumSolved: 50,
      hardSolved: 10,
      contestRating: 1742.8,
      contestGlobalRanking: 9001,
      badges: [
        { id: "1", name: "Annual Badge", iconUrl: "https://leetcode.com/badge.png", earnedAt: "2026-01-02" },
      ],
    });
  });

  test("uses nulls and empty collections for unavailable optional data", () => {
    const payload = structuredClone(complete);
    payload.data.userContestRanking = null as never;
    payload.data.matchedUser.badges = [];
    payload.data.matchedUser.submitStatsGlobal.acSubmissionNum = [];
    const result = normalizeLeetCodeResponse(payload, "coder");
    expect(result.contestRating).toBeNull();
    expect(result.contestGlobalRanking).toBeNull();
    expect(result.badges).toEqual([]);
    expect(result.totalSolved).toBe(0);
  });

  test("rejects a missing profile", () => {
    expect(() => normalizeLeetCodeResponse({ data: { matchedUser: null } }, "missing"))
      .toThrow(LeetCodeProfileNotFoundError);
  });
});

describe("fetchLeetCodePublicProfile", () => {
  test("classifies rate limiting", async () => {
    const fetcher = async () => new Response(null, { status: 429 });
    expect(fetchLeetCodePublicProfile("coder", fetcher)).rejects.toBeInstanceOf(
      LeetCodeRateLimitedError,
    );
  });

  test("classifies non-JSON challenge responses", async () => {
    const fetcher = async () => new Response("<html>challenge</html>", { status: 200 });
    expect(fetchLeetCodePublicProfile("coder", fetcher)).rejects.toBeInstanceOf(
      LeetCodeFetchError,
    );
  });
});
