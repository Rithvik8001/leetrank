import type { Prisma, PrismaClient } from "@prisma/client";

type AuditDb = PrismaClient | Prisma.TransactionClient;
export async function recordAudit(db: AuditDb, input: { id?: string; actorId: string; groupId?: string; action: string; targetType: string; targetId?: string; metadata?: Prisma.InputJsonValue }) {
  return db.auditEvent.create({ data: { id: input.id ?? crypto.randomUUID(), actorId: input.actorId, groupId: input.groupId, action: input.action, targetType: input.targetType, targetId: input.targetId, metadata: input.metadata } });
}
