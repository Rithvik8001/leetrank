import { SyncRunItemStatus, SyncRunStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { SYNC_LEASE_MS } from "@/lib/sync-runs";

export async function getSyncHealth(now = new Date()) {
  const staleCutoff = new Date(now.getTime() - SYNC_LEASE_MS);
  const [runs, lastSuccessful, staleLeases] = await Promise.all([
    prisma.syncRun.findMany({
      orderBy: { scheduledFor: "desc" },
      take: 30,
      include: {
        items: {
          where: { status: SyncRunItemStatus.FAILED },
          select: { id: true, userId: true, attempts: true, lastErrorCode: true, lastError: true },
          take: 25,
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.syncRun.findFirst({
      where: { status: SyncRunStatus.SUCCEEDED },
      orderBy: { finishedAt: "desc" },
    }),
    prisma.syncRunItem.count({
      where: { status: SyncRunItemStatus.RUNNING, leasedAt: { lte: staleCutoff } },
    }),
  ]);
  const counts = runs.length
    ? await prisma.syncRunItem.groupBy({
        by: ["runId", "status"],
        where: { runId: { in: runs.map((run) => run.id) } },
        _count: { _all: true },
      })
    : [];
  const byRun = new Map<string, Record<string, number>>();
  for (const row of counts) {
    const current = byRun.get(row.runId) ?? {};
    current[row.status] = row._count._all;
    byRun.set(row.runId, current);
  }
  return {
    lastSuccessful,
    staleLeases,
    runs: runs.map((run) => ({ ...run, counts: byRun.get(run.id) ?? {} })),
  };
}

