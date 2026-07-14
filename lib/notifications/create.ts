import type { Prisma, PrismaClient } from "@prisma/client";

import type { NotificationPayload } from "@/lib/notifications/copy";

type NotifyDb = PrismaClient | Prisma.TransactionClient;

// Mirrors recordAudit (lib/clubs/audit.ts): accepts a client or a transaction
// client so notifications are emitted inside the same $transaction as the
// mutation that caused them. A notification whose recipient is the actor is a
// no-op (you don't notify yourself of your own action).
export async function recordNotification(
  db: NotifyDb,
  input: NotificationPayload & { recipientId: string; eventKey: string; actorId?: string | null; metadata?: Prisma.InputJsonValue },
) {
  if (input.actorId && input.actorId === input.recipientId) return { count: 0 };
  return db.notification.createMany({
    data: [{
      id: crypto.randomUUID(),
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      groupId: input.groupId,
      challengeId: input.challengeId,
      entityType: input.entityType,
      entityId: input.entityId,
      title: input.title,
      body: input.body,
      href: input.href,
      metadata: input.metadata,
      eventKey: input.eventKey,
    }],
    skipDuplicates: true,
  });
}

// Fan-out: one createMany for many recipients sharing a payload. Skips the actor
// and de-duplicates recipient ids.
export async function recordNotifications(
  db: NotifyDb,
  input: NotificationPayload & {
    recipientIds: string[];
    eventKey: string;
    actorId?: string | null;
    metadata?: Prisma.InputJsonValue;
  },
) {
  const recipients = [...new Set(input.recipientIds)].filter(
    (id) => id !== input.actorId,
  );
  if (recipients.length === 0) return { count: 0 };
  return db.notification.createMany({
    data: recipients.map((recipientId) => ({
      id: crypto.randomUUID(),
      recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      groupId: input.groupId,
      challengeId: input.challengeId,
      entityType: input.entityType,
      entityId: input.entityId,
      title: input.title,
      body: input.body,
      href: input.href,
      metadata: input.metadata,
      eventKey: input.eventKey,
    })),
    skipDuplicates: true,
  });
}
