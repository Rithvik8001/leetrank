import { describe, expect, test } from "bun:test";

import { evaluateWindow, getClientIp, type RateLimitRule } from "./rate-limit";

describe("evaluateWindow", () => {
  const rule: RateLimitRule = { windowMs: 10_000, max: 3 };
  const t0 = 1_000_000;

  test("first request opens a fresh window", () => {
    const { next, result } = evaluateWindow(null, rule, t0);
    expect(next).toEqual({ count: 1, lastRequest: t0 });
    expect(result).toEqual({ allowed: true, retryAfterMs: 0, remaining: 2 });
  });

  test("increments within the window, anchor stays put", () => {
    const { next, result } = evaluateWindow(
      { count: 1, lastRequest: t0 },
      rule,
      t0 + 2_000,
    );
    expect(next).toEqual({ count: 2, lastRequest: t0 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  test("denies once max is exceeded and reports retryAfter", () => {
    const { next, result } = evaluateWindow(
      { count: 3, lastRequest: t0 },
      rule,
      t0 + 4_000,
    );
    expect(next.count).toBe(4);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    // window resets at t0 + 10_000; now is t0 + 4_000 → 6_000ms left.
    expect(result.retryAfterMs).toBe(6_000);
  });

  test("resets exactly past the window boundary", () => {
    // now - lastRequest must be strictly greater than windowMs to reset.
    const onBoundary = evaluateWindow(
      { count: 3, lastRequest: t0 },
      rule,
      t0 + rule.windowMs,
    );
    expect(onBoundary.next.count).toBe(4); // still same window (not > windowMs)
    expect(onBoundary.result.allowed).toBe(false);

    const past = evaluateWindow(
      { count: 3, lastRequest: t0 },
      rule,
      t0 + rule.windowMs + 1,
    );
    expect(past.next).toEqual({ count: 1, lastRequest: t0 + rule.windowMs + 1 });
    expect(past.result.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  test("takes the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  test("falls back to x-real-ip, then 'unknown'", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
