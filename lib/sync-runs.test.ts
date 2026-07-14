import { describe, expect, test } from "bun:test";
import { SyncRunItemStatus, SyncRunStatus } from "@prisma/client";

import { finalRunStatus, isLeaseStale, isSyncWindowOpen, SYNC_LEASE_MS, utcDay } from "@/lib/sync-runs";

describe("sync run scheduling", () => {
  test("opens at 06:00 UTC and buckets by UTC day", () => {
    expect(isSyncWindowOpen(new Date("2026-07-14T05:59:59Z"))).toBe(false);
    expect(isSyncWindowOpen(new Date("2026-07-14T06:00:00Z"))).toBe(true);
    expect(utcDay(new Date("2026-07-14T23:59:59Z")).toISOString()).toBe("2026-07-14T00:00:00.000Z");
  });

  test("classifies terminal status from item aggregates", () => {
    expect(finalRunStatus({ [SyncRunItemStatus.SUCCEEDED]: 2 })).toBe(SyncRunStatus.SUCCEEDED);
    expect(finalRunStatus({ [SyncRunItemStatus.SUCCEEDED]: 1, [SyncRunItemStatus.FAILED]: 1 })).toBe(SyncRunStatus.PARTIAL);
    expect(finalRunStatus({ [SyncRunItemStatus.FAILED]: 2 })).toBe(SyncRunStatus.FAILED);
  });

  test("leases become stale at the ten minute boundary", () => {
    const now = new Date("2026-07-14T12:00:00Z");
    expect(isLeaseStale(new Date(now.getTime() - SYNC_LEASE_MS), now)).toBe(true);
    expect(isLeaseStale(new Date(now.getTime() - SYNC_LEASE_MS + 1), now)).toBe(false);
    expect(isLeaseStale(null, now)).toBe(false);
  });
});

