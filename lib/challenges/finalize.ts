import { prisma } from "@/lib/prisma";
import { todayUtcDate } from "@/lib/challenges/dates";
import { buildChallengeStandings } from "@/lib/challenges/queries";
import type { ChallengeMetricValue } from "@/lib/challenges/constants";
import { buildNotification } from "@/lib/notifications/copy";
import { recordNotification } from "@/lib/notifications/create";

export async function finalizeEndedChallenges(now = new Date()) {
  const today = todayUtcDate(now);
  const challenges = await prisma.groupChallenge.findMany({
    where: {
      endsOn: { lt: today },
      participants: { some: { finalizedAt: null } },
    },
    select: {
      id: true,
      groupId: true,
      title: true,
      metric: true,
      startsOn: true,
      endsOn: true,
      participants: {
        where: { finalizedAt: null },
        select: {
          id: true,
          userId: true,
          joinedAt: true,
          baselineKind: true,
          baselineTotalSolved: true,
          baselineHardSolved: true,
          baselineContestRating: true,
          baselineCapturedAt: true,
          finalMetricValue: true,
          finalDelta: true,
          finalizedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              leetcodeUsername: true,
              leetcodeTotalSolved: true,
              leetcodeHardSolved: true,
              leetcodeContestRating: true,
              publicProfileEnabled: true,
              publicProfileHandle: true,
            },
          },
        },
      },
    },
  });

  let finalized = 0;
  for (const challenge of challenges) {
    const standings = await buildChallengeStandings(
      {
        metric: challenge.metric as ChallengeMetricValue,
        startsOn: challenge.startsOn,
        endsOn: challenge.endsOn,
        status: "ended",
      },
      challenge.participants,
    );

    for (const row of standings) {
      await prisma.$transaction(async (tx) => {
        await tx.challengeParticipant.update({
          where: { id: row.id },
          data: {
            finalMetricValue: row.currentValue,
            finalDelta: row.delta,
            finalizedAt: now,
          },
        });
        await recordNotification(tx, {
          ...buildNotification({
            kind: "CHALLENGE_FINISHED",
            groupId: challenge.groupId,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            finalDelta: row.delta,
          }),
          recipientId: row.userId,
          eventKey: `challenge:${challenge.id}:finished:${row.id}`,
        });
      });
      finalized += 1;
    }
  }

  return { challenges: challenges.length, participants: finalized };
}
