import {
  Prisma,
  SyncRunItemStatus,
  SyncRunStatus,
  type SyncRun,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { syncScheduledUserStats } from "@/lib/leetcode-sync";
import { finalizeEndedChallenges } from "@/lib/challenges/finalize";
import { generateChallengeNotifications } from "@/lib/notifications/challenges";
import { logEvent } from "@/lib/observability";

export const SYNC_START_HOUR_UTC = 6;
export const SYNC_BATCH_SIZE = 25;
export const SYNC_LEASE_MS = 10 * 60 * 1000;
export const SYNC_MAX_ATTEMPTS = 3;
const PACE_MS = 750;

const ACTIVE_RUN_STATUSES: SyncRunStatus[] = [
  SyncRunStatus.QUEUED,
  SyncRunStatus.RUNNING,
];

export function utcDay(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function isSyncWindowOpen(now: Date) {
  return now.getUTCHours() >= SYNC_START_HOUR_UTC;
}

export function isLeaseStale(leasedAt: Date | null, now: Date) {
  return Boolean(leasedAt && leasedAt.getTime() <= now.getTime() - SYNC_LEASE_MS);
}

export function finalRunStatus(counts: Record<string, number>): SyncRunStatus {
  const failed = counts[SyncRunItemStatus.FAILED] ?? 0;
  const succeeded = counts[SyncRunItemStatus.SUCCEEDED] ?? 0;
  const skipped = counts[SyncRunItemStatus.SKIPPED] ?? 0;
  if (failed === 0) return SyncRunStatus.SUCCEEDED;
  return succeeded + skipped === 0 ? SyncRunStatus.FAILED : SyncRunStatus.PARTIAL;
}

async function createRun(scheduledFor: Date, now: Date) {
  try {
    const run = await prisma.$transaction(async (tx) => {
      const created = await tx.syncRun.create({
        data: {
          id: crypto.randomUUID(),
          scheduledFor,
          status: SyncRunStatus.RUNNING,
          startedAt: now,
          heartbeatAt: now,
        },
      });
      const users = await tx.user.findMany({
        where: { leetcodeVerified: true, leetcodeUsername: { not: null } },
        select: { id: true },
      });
      if (users.length) {
        await tx.syncRunItem.createMany({
          data: users.map((user) => ({
            id: crypto.randomUUID(),
            runId: created.id,
            userId: user.id,
          })),
        });
      }
      return created;
    });
    logEvent("info", "sync_run.created", {
      runId: run.id,
      scheduledFor: scheduledFor.toISOString().slice(0, 10),
    });
    return run;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.syncRun.findUniqueOrThrow({ where: { scheduledFor } });
    }
    throw error;
  }
}

export async function ensureCurrentRun(now = new Date()): Promise<SyncRun | null> {
  const active = await prisma.syncRun.findFirst({
    where: { status: { in: ACTIVE_RUN_STATUSES } },
    orderBy: { scheduledFor: "asc" },
  });
  if (active) return active;
  if (!isSyncWindowOpen(now)) return null;
  const scheduledFor = utcDay(now);
  const existing = await prisma.syncRun.findUnique({ where: { scheduledFor } });
  if (existing) return existing;
  return createRun(scheduledFor, now);
}

export async function recoverStaleLeases(runId: string, now = new Date()) {
  const cutoff = new Date(now.getTime() - SYNC_LEASE_MS);
  const recovered = await prisma.syncRunItem.updateMany({
    where: { runId, status: SyncRunItemStatus.RUNNING, leasedAt: { lte: cutoff } },
    data: {
      status: SyncRunItemStatus.PENDING,
      leaseToken: null,
      leasedAt: null,
      lastErrorCode: "STALE_LEASE",
      lastError: "Worker lease expired; item was returned to the queue.",
    },
  });
  if (recovered.count) logEvent("warn", "sync_run.stale_leases_recovered", { runId, count: recovered.count });
  return recovered.count;
}

type ClaimedItem = { id: string; userId: string | null; attempts: number };

export async function claimBatch(runId: string, leaseToken: string, now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<ClaimedItem[]>`
      UPDATE "sync_run_item"
      SET "status" = 'RUNNING'::"sync_run_item_status",
          "leaseToken" = ${leaseToken},
          "leasedAt" = ${now},
          "startedAt" = COALESCE("startedAt", ${now}),
          "attempts" = "attempts" + 1,
          "updatedAt" = ${now}
      WHERE "id" IN (
        SELECT "id" FROM "sync_run_item"
        WHERE "runId" = ${runId}
          AND "status" = 'PENDING'::"sync_run_item_status"
        ORDER BY "createdAt", "id"
        LIMIT ${SYNC_BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id", "userId", "attempts"
    `;
    await tx.syncRun.update({ where: { id: runId }, data: { status: SyncRunStatus.RUNNING, heartbeatAt: now } });
    return rows;
  });
}

async function setItemOutcome(
  item: ClaimedItem,
  leaseToken: string,
  result: Awaited<ReturnType<typeof syncScheduledUserStats>>,
  now: Date,
) {
  if (result.ok) {
    return prisma.syncRunItem.updateMany({
      where: { id: item.id, leaseToken, status: SyncRunItemStatus.RUNNING },
      data: {
        status: result.kind === "skipped" ? SyncRunItemStatus.SKIPPED : SyncRunItemStatus.SUCCEEDED,
        leaseToken: null,
        leasedAt: null,
        lastError: null,
        lastErrorCode: null,
        finishedAt: now,
      },
    });
  }
  const retry = result.kind === "transient" && item.attempts < SYNC_MAX_ATTEMPTS;
  logEvent(retry ? "warn" : "error", "sync_run.item_failed", {
    itemId: item.id,
    code: result.code,
    attempt: item.attempts,
    retry,
  });
  return prisma.syncRunItem.updateMany({
    where: { id: item.id, leaseToken, status: SyncRunItemStatus.RUNNING },
    data: {
      status: retry ? SyncRunItemStatus.PENDING : SyncRunItemStatus.FAILED,
      leaseToken: null,
      leasedAt: null,
      lastErrorCode: result.code,
      lastError: result.error.slice(0, 240),
      finishedAt: retry ? null : now,
    },
  });
}

async function itemCounts(runId: string) {
  const rows = await prisma.syncRunItem.groupBy({
    by: ["status"],
    where: { runId },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((row) => [row.status, row._count._all]));
}

async function runTerminalStages(run: SyncRun, now: Date) {
  let current = await prisma.syncRun.findUniqueOrThrow({ where: { id: run.id } });
  try {
    if (!current.challengeFinalizedAt) {
      await finalizeEndedChallenges(now);
      current = await prisma.syncRun.update({
        where: { id: run.id },
        data: { challengeFinalizedAt: now, terminalStageAttempts: 0, lastError: null, lastErrorCode: null },
      });
    }
    if (!current.challengeNotificationsAt) {
      await generateChallengeNotifications(now);
      current = await prisma.syncRun.update({
        where: { id: run.id },
        data: { challengeNotificationsAt: now, terminalStageAttempts: 0, lastError: null, lastErrorCode: null },
      });
    }
    return true;
  } catch (error) {
    const attempts = current.terminalStageAttempts + 1;
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        terminalStageAttempts: attempts,
        status: attempts >= SYNC_MAX_ATTEMPTS ? SyncRunStatus.FAILED : SyncRunStatus.RUNNING,
        lastErrorCode: "TERMINAL_STAGE_FAILED",
        lastError: error instanceof Error ? error.message.slice(0, 240) : "Terminal stage failed.",
      },
    });
    logEvent("error", "sync_run.terminal_stage_failed", { runId: run.id, attempts });
    return false;
  }
}

export async function processSyncTick(now = new Date()) {
  const run = await ensureCurrentRun(now);
  if (!run) return { noop: true, reason: "before_sync_window" as const };
  if (run.status !== SyncRunStatus.QUEUED && run.status !== SyncRunStatus.RUNNING) {
    return { noop: true, reason: "run_already_terminal" as const, runId: run.id, status: run.status };
  }

  const recovered = await recoverStaleLeases(run.id, now);
  const leaseToken = crypto.randomUUID();
  const claimed = await claimBatch(run.id, leaseToken, now);
  logEvent("info", "sync_run.batch_claimed", { runId: run.id, leaseToken, claimed: claimed.length, recovered });

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;
  let retried = 0;
  for (const item of claimed) {
    const result = item.userId
      ? await syncScheduledUserStats(item.userId, run.scheduledFor, new Date())
      : ({ ok: true, kind: "skipped" } as const);
    await setItemOutcome(item, leaseToken, result, new Date());
    if (result.ok && result.kind === "success") succeeded += 1;
    else if (result.ok) skipped += 1;
    else if (result.kind === "transient" && item.attempts < SYNC_MAX_ATTEMPTS) retried += 1;
    else failed += 1;
    await new Promise((resolve) => setTimeout(resolve, PACE_MS));
  }

  const counts = await itemCounts(run.id);
  const remaining = (counts[SyncRunItemStatus.PENDING] ?? 0) + (counts[SyncRunItemStatus.RUNNING] ?? 0);
  let status: SyncRunStatus = SyncRunStatus.RUNNING;
  let stagesCompleted = false;
  if (remaining === 0) {
    stagesCompleted = await runTerminalStages(run, new Date());
    if (stagesCompleted) {
      status = finalRunStatus(counts);
      await prisma.syncRun.update({
        where: { id: run.id },
        data: { status, finishedAt: new Date(), heartbeatAt: new Date() },
      });
      logEvent("info", "sync_run.completed", { runId: run.id, status });
    }
  } else {
    await prisma.syncRun.update({ where: { id: run.id }, data: { heartbeatAt: new Date() } });
  }

  logEvent("info", "sync_run.batch_completed", {
    runId: run.id,
    leaseToken,
    claimed: claimed.length,
    succeeded,
    skipped,
    failed,
    retried,
    remaining,
  });
  return {
    noop: false,
    runId: run.id,
    scheduledFor: run.scheduledFor.toISOString().slice(0, 10),
    status,
    claimed: claimed.length,
    recovered,
    outcomes: { succeeded, skipped, failed, retried },
    remaining,
    stagesCompleted,
  };
}
