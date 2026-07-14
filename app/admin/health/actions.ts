"use server";

import { SyncRunItemStatus, SyncRunStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/clubs/auth";
import { recordAudit } from "@/lib/clubs/audit";
import { SYNC_LEASE_MS } from "@/lib/sync-runs";

type Result = { ok: true } | { ok: false; error: string };

async function admin() {
  return requirePlatformAdmin();
}

function refresh() {
  revalidatePath("/admin/health");
}

export async function resumeSyncRun(runId: string): Promise<Result> {
  const actor = await admin();
  if (!actor) return { ok: false, error: "Platform admin access required." };
  await prisma.$transaction(async (tx) => {
    const changed = await tx.syncRun.updateMany({
      where: { id: runId, status: { in: [SyncRunStatus.PARTIAL, SyncRunStatus.FAILED] } },
      data: { status: SyncRunStatus.RUNNING, finishedAt: null, terminalStageAttempts: 0, lastError: null, lastErrorCode: null },
    });
    if (!changed.count) return;
    await tx.syncRunItem.updateMany({
      where: { runId, status: SyncRunItemStatus.FAILED },
      data: { status: SyncRunItemStatus.PENDING, attempts: 0, finishedAt: null, lastError: null, lastErrorCode: null },
    });
    await recordAudit(tx, { actorId: actor.id, action: "sync.run.resumed", targetType: "SyncRun", targetId: runId });
  });
  refresh();
  return { ok: true };
}

export async function retrySyncItem(itemId: string): Promise<Result> {
  const actor = await admin();
  if (!actor) return { ok: false, error: "Platform admin access required." };
  await prisma.$transaction(async (tx) => {
    const item = await tx.syncRunItem.findUnique({ where: { id: itemId }, select: { runId: true, status: true } });
    if (!item || item.status !== SyncRunItemStatus.FAILED) return;
    await tx.syncRunItem.update({
      where: { id: itemId },
      data: { status: SyncRunItemStatus.PENDING, attempts: 0, finishedAt: null, lastError: null, lastErrorCode: null },
    });
    await tx.syncRun.update({ where: { id: item.runId }, data: { status: SyncRunStatus.RUNNING, finishedAt: null } });
    await recordAudit(tx, { actorId: actor.id, action: "sync.item.retried", targetType: "SyncRunItem", targetId: itemId });
  });
  refresh();
  return { ok: true };
}

export async function releaseStaleLeases(): Promise<Result> {
  const actor = await admin();
  if (!actor) return { ok: false, error: "Platform admin access required." };
  const cutoff = new Date(Date.now() - SYNC_LEASE_MS);
  await prisma.$transaction(async (tx) => {
    const changed = await tx.syncRunItem.updateMany({
      where: { status: SyncRunItemStatus.RUNNING, leasedAt: { lte: cutoff } },
      data: { status: SyncRunItemStatus.PENDING, leaseToken: null, leasedAt: null, lastErrorCode: "ADMIN_RELEASED", lastError: "A stale worker lease was released by an administrator." },
    });
    if (changed.count) await recordAudit(tx, { actorId: actor.id, action: "sync.leases.released", targetType: "SyncRunItem", metadata: { count: changed.count } });
  });
  refresh();
  return { ok: true };
}

export async function retryTerminalStage(runId: string): Promise<Result> {
  const actor = await admin();
  if (!actor) return { ok: false, error: "Platform admin access required." };
  await prisma.$transaction(async (tx) => {
    const changed = await tx.syncRun.updateMany({
      where: { id: runId, status: SyncRunStatus.FAILED, OR: [{ challengeFinalizedAt: null }, { challengeNotificationsAt: null }] },
      data: { status: SyncRunStatus.RUNNING, finishedAt: null, terminalStageAttempts: 0, lastError: null, lastErrorCode: null },
    });
    if (changed.count) await recordAudit(tx, { actorId: actor.id, action: "sync.terminal_stage.retried", targetType: "SyncRun", targetId: runId });
  });
  refresh();
  return { ok: true };
}

