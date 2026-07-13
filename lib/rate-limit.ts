import { prisma } from "@/lib/prisma";

// Fixed-window rate limiting backed by the shared `RateLimit` Postgres table
// (see prisma/schema.prisma). Keys written here are prefixed "rl:" so they
// never collide with Better Auth's path-based keys in the same table.

export type RateLimitRule = {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum allowed requests per window. */
  max: number;
};

export type RateLimitResult = {
  allowed: boolean;
  /** Milliseconds until the current window resets (0 when allowed). */
  retryAfterMs: number;
  /** Requests left in the current window (0 when denied). */
  remaining: number;
};

const MINUTE = 60 * 1000;

// Rules for the app's sensitive surfaces. Mirrors the constants idiom in
// lib/leetcode-sync.ts (SYNC_COOLDOWN_MS).
export const VERIFY_BIO: RateLimitRule = { windowMs: 10 * MINUTE, max: 5 };
export const GENERATE_CODE: RateLimitRule = { windowMs: 10 * MINUTE, max: 5 };
export const PROFILE_SEARCH: RateLimitRule = { windowMs: MINUTE, max: 30 };

type WindowState = { count: number; lastRequest: number };

/**
 * Pure fixed-window evaluation: given the stored state for a key (or null when
 * absent) and the current clock, compute the next state to persist and the
 * caller-facing result. The atomic SQL in `consumeRateLimit` mirrors this math;
 * this function exists so the window logic is unit-testable without a DB.
 */
export function evaluateWindow(
  existing: WindowState | null,
  rule: RateLimitRule,
  now: number,
): { next: WindowState; result: RateLimitResult } {
  const windowExpired =
    !existing || now - existing.lastRequest > rule.windowMs;

  // On reset, the window is anchored at `now`; within a live window the anchor
  // (lastRequest) stays put so the reset time doesn't slide on each request.
  const next: WindowState = windowExpired
    ? { count: 1, lastRequest: now }
    : { count: existing.count + 1, lastRequest: existing.lastRequest };

  const allowed = next.count <= rule.max;
  const retryAfterMs = allowed
    ? 0
    : Math.max(0, next.lastRequest + rule.windowMs - now);

  return {
    next,
    result: {
      allowed,
      retryAfterMs,
      remaining: Math.max(0, rule.max - next.count),
    },
  };
}

/**
 * Atomically consume one unit against `key`. Uses a single
 * INSERT ... ON CONFLICT so concurrent calls can't race a read-then-write.
 * Fails open (logs + allows) if the store is unreachable — a limiter outage
 * must never hard-block legitimate users.
 */
export async function consumeRateLimit(
  key: string,
  rule: RateLimitRule,
  now = Date.now(),
): Promise<RateLimitResult> {
  const fullKey = `rl:${key}`;
  const nowBig = BigInt(now);
  const windowBig = BigInt(rule.windowMs);

  try {
    const rows = await prisma.$queryRaw<
      { count: number; lastRequest: bigint }[]
    >`
      INSERT INTO "rate_limit" ("id", "key", "count", "lastRequest")
      VALUES (${crypto.randomUUID()}, ${fullKey}, 1, ${nowBig})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN ${nowBig} - "rate_limit"."lastRequest" > ${windowBig} THEN 1
          ELSE "rate_limit"."count" + 1
        END,
        "lastRequest" = CASE
          WHEN ${nowBig} - "rate_limit"."lastRequest" > ${windowBig} THEN ${nowBig}
          ELSE "rate_limit"."lastRequest"
        END
      RETURNING "count", "lastRequest"
    `;

    const row = rows[0];
    if (!row) return { allowed: true, retryAfterMs: 0, remaining: rule.max - 1 };

    // Derive the result from the authoritative persisted row. The SQL above
    // performs the same reset/increment as evaluateWindow(); the returned
    // count/lastRequest already reflect the post-write window state.
    const windowStart = Number(row.lastRequest);
    const allowed = row.count <= rule.max;
    return {
      allowed,
      retryAfterMs: allowed ? 0 : Math.max(0, windowStart + rule.windowMs - now),
      remaining: Math.max(0, rule.max - row.count),
    };
  } catch (error) {
    console.warn(`Rate limit check failed for ${fullKey}:`, error);
    return { allowed: true, retryAfterMs: 0, remaining: rule.max - 1 };
  }
}

/** Best-effort client IP from proxy headers; "unknown" when unavailable. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
