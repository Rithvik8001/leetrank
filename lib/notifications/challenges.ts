import { prisma } from "@/lib/prisma";
import { todayUtcDate } from "@/lib/challenges/dates";
import { buildNotification } from "@/lib/notifications/copy";
import { recordNotifications } from "@/lib/notifications/create";

const DAY_MS = 24 * 60 * 60 * 1000;

// Emits challenge STARTED (startsOn === today) and ENDING_SOON (endsOn === tomorrow)
// notifications. Driven by the daily cron; because it runs once per UTC day on exact
// day boundaries, each challenge crosses these thresholds on a single run — no dedup
// table needed. CHALLENGE_FINISHED is emitted separately from finalizeEndedChallenges.
export async function generateChallengeNotifications(now = new Date()) {
  const today = todayUtcDate(now);
  const tomorrow = new Date(today.getTime() + DAY_MS);

  const challenges = await prisma.groupChallenge.findMany({
    where: {
      OR: [{ startsOn: today }, { endsOn: tomorrow }],
    },
    select: {
      id: true,
      groupId: true,
      title: true,
      startsOn: true,
      endsOn: true,
      participants: { select: { userId: true } },
    },
  });

  let started = 0;
  let endingSoon = 0;
  for (const challenge of challenges) {
    const recipientIds = challenge.participants.map((p) => p.userId);
    if (recipientIds.length === 0) continue;

    if (challenge.startsOn.getTime() === today.getTime()) {
      const payload = buildNotification({
        kind: "CHALLENGE_STARTED",
        groupId: challenge.groupId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
      });
      await recordNotifications(prisma, { ...payload, recipientIds });
      started += 1;
    }

    if (challenge.endsOn.getTime() === tomorrow.getTime()) {
      const payload = buildNotification({
        kind: "CHALLENGE_ENDING_SOON",
        groupId: challenge.groupId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
      });
      await recordNotifications(prisma, { ...payload, recipientIds });
      endingSoon += 1;
    }
  }

  return { started, endingSoon };
}
