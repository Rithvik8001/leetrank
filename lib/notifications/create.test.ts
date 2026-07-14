import { describe, expect, test } from "bun:test";
import type { PrismaClient } from "@prisma/client";

import { recordNotification, recordNotifications } from "@/lib/notifications/create";

function fakeDb() {
  const keys = new Set<string>();
  const db = {
    notification: {
      createMany: async ({ data }: { data: { recipientId: string; eventKey: string }[] }) => {
        let count = 0;
        for (const row of data) {
          const key = `${row.recipientId}:${row.eventKey}`;
          if (!keys.has(key)) { keys.add(key); count += 1; }
        }
        return { count };
      },
    },
  } as unknown as PrismaClient;
  return { db, keys };
}

const payload = { type: "CHALLENGE_STARTED" as const, groupId: "group-1", challengeId: "challenge-1", entityType: "challenge", entityId: "challenge-1", title: "Started", href: "/groups/group-1" };

describe("idempotent notification creation", () => {
  test("replaying one recipient event creates one row", async () => {
    const { db } = fakeDb();
    expect((await recordNotification(db, { ...payload, recipientId: "user-1", eventKey: "event-1" })).count).toBe(1);
    expect((await recordNotification(db, { ...payload, recipientId: "user-1", eventKey: "event-1" })).count).toBe(0);
  });

  test("fan-out deduplicates recipients and skips the actor", async () => {
    const { db, keys } = fakeDb();
    await recordNotifications(db, { ...payload, recipientIds: ["user-1", "user-1", "actor"], actorId: "actor", eventKey: "event-1" });
    expect([...keys]).toEqual(["user-1:event-1"]);
  });

  test("distinct lifecycle keys remain distinct", async () => {
    const { db, keys } = fakeDb();
    await recordNotification(db, { ...payload, recipientId: "user-1", eventKey: "started" });
    await recordNotification(db, { ...payload, recipientId: "user-1", eventKey: "finished" });
    expect(keys.size).toBe(2);
  });
});
