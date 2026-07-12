import {
  ChallengeBaselineKind,
  type ChallengeMetric,
  type ChallengeParticipant,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { challengeStatus, todayUtcDate } from "@/lib/challenges/dates";
import {
  CHALLENGE_METRIC_LABELS,
  CHALLENGE_METRIC_SHORT_LABELS,
  type ChallengeMetricValue,
} from "@/lib/challenges/constants";
import {
  metricValue,
  rankChallengeStandings,
  type ChallengeMetricStats,
  type ChallengeStanding,
  type ChallengeStandingInput,
} from "@/lib/challenges/scoring";

type SnapshotStats = {
  userId: string;
  capturedAt: Date;
  totalSolved: number;
  hardSolved: number;
  contestRating: number | null;
};

type ParticipantWithUser = Pick<
  ChallengeParticipant,
  | "id"
  | "userId"
  | "joinedAt"
  | "baselineKind"
  | "baselineTotalSolved"
  | "baselineHardSolved"
  | "baselineContestRating"
  | "baselineCapturedAt"
  | "finalMetricValue"
  | "finalDelta"
  | "finalizedAt"
> & {
  user: {
    id: string;
    name: string;
    leetcodeUsername: string | null;
    leetcodeTotalSolved: number | null;
    leetcodeHardSolved: number | null;
    leetcodeContestRating: number | null;
    publicProfileEnabled: boolean;
    publicProfileHandle: string | null;
  };
};

export type ChallengeSummary = {
  id: string;
  title: string;
  description: string | null;
  metric: ChallengeMetricValue;
  metricLabel: string;
  startsOn: Date;
  endsOn: Date;
  status: "upcoming" | "active" | "ended";
  participantCount: number;
};

export type GroupChallengesForMember = {
  group: { id: string; name: string; isOwner: boolean };
  challenges: ChallengeSummary[];
};

export type ChallengeDetail = {
  group: { id: string; name: string; isOwner: boolean };
  challenge: ChallengeSummary;
  viewerParticipant: { id: string; joinedAt: Date } | null;
  standings: ChallengeStanding[];
};

export type ChallengeBaseline = {
  kind: ChallengeBaselineKind;
  totalSolved: number | null;
  hardSolved: number | null;
  contestRating: number | null;
  capturedAt: Date | null;
};

function metricKey(metric: ChallengeMetric): ChallengeMetricValue {
  return metric as ChallengeMetricValue;
}

function toSummary(
  challenge: {
    id: string;
    title: string;
    description: string | null;
    metric: ChallengeMetric;
    startsOn: Date;
    endsOn: Date;
    _count: { participants: number };
  },
  now = new Date(),
): ChallengeSummary {
  const metric = metricKey(challenge.metric);
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    metric,
    metricLabel: CHALLENGE_METRIC_LABELS[metric],
    startsOn: challenge.startsOn,
    endsOn: challenge.endsOn,
    status: challengeStatus(challenge.startsOn, challenge.endsOn, now),
    participantCount: challenge._count.participants,
  };
}

function profileHref(user: ParticipantWithUser["user"]): string | null {
  return user.publicProfileEnabled && user.publicProfileHandle
    ? `/u/${user.publicProfileHandle}`
    : null;
}

function userStats(user: ParticipantWithUser["user"]): ChallengeMetricStats {
  return {
    totalSolved: user.leetcodeTotalSolved,
    hardSolved: user.leetcodeHardSolved,
    contestRating: user.leetcodeContestRating,
  };
}

function snapshotStats(snapshot: SnapshotStats): ChallengeMetricStats {
  return {
    totalSolved: snapshot.totalSolved,
    hardSolved: snapshot.hardSolved,
    contestRating: snapshot.contestRating,
  };
}

function participantBaseline(participant: ParticipantWithUser): ChallengeBaseline {
  const hasBaseline =
    participant.baselineTotalSolved != null ||
    participant.baselineHardSolved != null ||
    participant.baselineContestRating != null;
  return {
    kind: hasBaseline ? participant.baselineKind : ChallengeBaselineKind.PENDING,
    totalSolved: participant.baselineTotalSolved,
    hardSolved: participant.baselineHardSolved,
    contestRating: participant.baselineContestRating,
    capturedAt: participant.baselineCapturedAt,
  };
}

async function latestSnapshotsByUser(
  userIds: string[],
  whereDate: { lt?: Date; lte?: Date },
): Promise<Map<string, SnapshotStats>> {
  if (!userIds.length) return new Map();
  const rows = await prisma.leetcodeSnapshot.findMany({
    where: { userId: { in: userIds }, capturedOn: whereDate },
    orderBy: [{ userId: "asc" }, { capturedOn: "desc" }],
    select: {
      userId: true,
      capturedAt: true,
      totalSolved: true,
      hardSolved: true,
      contestRating: true,
    },
  });

  const byUser = new Map<string, SnapshotStats>();
  for (const row of rows) {
    if (!byUser.has(row.userId)) byUser.set(row.userId, row);
  }
  return byUser;
}

export async function getChallengeBaselineForUser(
  userId: string,
  startsOn: Date,
): Promise<ChallengeBaseline | null> {
  const snapshot = await prisma.leetcodeSnapshot.findFirst({
    where: { userId, capturedOn: { lt: startsOn } },
    orderBy: { capturedOn: "desc" },
    select: {
      capturedAt: true,
      totalSolved: true,
      hardSolved: true,
      contestRating: true,
    },
  });
  if (snapshot) {
    return {
      kind: ChallengeBaselineKind.START_SNAPSHOT,
      totalSolved: snapshot.totalSolved,
      hardSolved: snapshot.hardSolved,
      contestRating: snapshot.contestRating,
      capturedAt: snapshot.capturedAt,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      leetcodeTotalSolved: true,
      leetcodeHardSolved: true,
      leetcodeContestRating: true,
      leetcodeLastSyncedAt: true,
    },
  });
  if (!user) return null;
  return {
    kind: ChallengeBaselineKind.JOIN_FALLBACK,
    totalSolved: user.leetcodeTotalSolved,
    hardSolved: user.leetcodeHardSolved,
    contestRating: user.leetcodeContestRating,
    capturedAt: user.leetcodeLastSyncedAt,
  };
}

export async function getGroupChallengesForMember(
  groupId: string,
  userId: string,
  now = new Date(),
): Promise<GroupChallengesForMember | null> {
  const group = await prisma.group.findFirst({
    where: { id: groupId, memberships: { some: { userId } } },
    select: { id: true, name: true, ownerId: true },
  });
  if (!group) return null;

  const challenges = await prisma.groupChallenge.findMany({
    where: { groupId },
    orderBy: [{ startsOn: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      metric: true,
      startsOn: true,
      endsOn: true,
      _count: { select: { participants: true } },
    },
  });

  return {
    group: { id: group.id, name: group.name, isOwner: group.ownerId === userId },
    challenges: challenges.map((challenge) => toSummary(challenge, now)),
  };
}

export async function getGroupChallengeHighlights(
  groupId: string,
  now = new Date(),
): Promise<ChallengeSummary[]> {
  const today = todayUtcDate(now);
  const challenges = await prisma.groupChallenge.findMany({
    where: { groupId, endsOn: { gte: today } },
    orderBy: [{ startsOn: "asc" }, { createdAt: "asc" }],
    take: 3,
    select: {
      id: true,
      title: true,
      description: true,
      metric: true,
      startsOn: true,
      endsOn: true,
      _count: { select: { participants: true } },
    },
  });
  return challenges.map((challenge) => toSummary(challenge, now));
}

export async function getChallengeForMember(
  groupId: string,
  challengeId: string,
  userId: string,
  now = new Date(),
): Promise<ChallengeDetail | null> {
  const group = await prisma.group.findFirst({
    where: { id: groupId, memberships: { some: { userId } } },
    select: { id: true, name: true, ownerId: true },
  });
  if (!group) return null;

  const challenge = await prisma.groupChallenge.findFirst({
    where: { id: challengeId, groupId },
    select: {
      id: true,
      title: true,
      description: true,
      metric: true,
      startsOn: true,
      endsOn: true,
      _count: { select: { participants: true } },
      participants: {
        orderBy: { joinedAt: "asc" },
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
  if (!challenge) return null;

  const standings = await buildChallengeStandings(
    {
      metric: metricKey(challenge.metric),
      startsOn: challenge.startsOn,
      endsOn: challenge.endsOn,
      status: challengeStatus(challenge.startsOn, challenge.endsOn, now),
    },
    challenge.participants,
  );

  return {
    group: { id: group.id, name: group.name, isOwner: group.ownerId === userId },
    challenge: toSummary(challenge, now),
    viewerParticipant:
      challenge.participants.find((participant) => participant.userId === userId) ?? null,
    standings,
  };
}

export async function buildChallengeStandings(
  challenge: {
    metric: ChallengeMetricValue;
    startsOn: Date;
    endsOn: Date;
    status: "upcoming" | "active" | "ended";
  },
  participants: ParticipantWithUser[],
): Promise<ChallengeStanding[]> {
  const userIds = participants.map((participant) => participant.userId);
  const [baselineSnapshots, finalSnapshots] = await Promise.all([
    latestSnapshotsByUser(userIds, { lt: challenge.startsOn }),
    challenge.status === "ended"
      ? latestSnapshotsByUser(userIds, { lte: challenge.endsOn })
      : Promise.resolve(new Map<string, SnapshotStats>()),
  ]);

  const rows: ChallengeStandingInput[] = participants.map((participant) => {
    const baselineSnapshot = baselineSnapshots.get(participant.userId);
    const fallbackBaseline = participantBaseline(participant);
    const baselineStats = baselineSnapshot
      ? snapshotStats(baselineSnapshot)
      : {
          totalSolved: fallbackBaseline.totalSolved,
          hardSolved: fallbackBaseline.hardSolved,
          contestRating: fallbackBaseline.contestRating,
        };
    const baselineKind = baselineSnapshot
      ? ChallengeBaselineKind.START_SNAPSHOT
      : fallbackBaseline.kind;
    const baselineValue = metricValue(baselineStats, challenge.metric);

    let currentValue: number | null = null;
    let delta: number | null = null;
    let finalized = false;

    if (participant.finalizedAt) {
      currentValue = participant.finalMetricValue;
      delta = participant.finalDelta;
      finalized = true;
    } else if (challenge.status === "active") {
      currentValue = metricValue(userStats(participant.user), challenge.metric);
      delta = currentValue == null || baselineValue == null ? null : currentValue - baselineValue;
    } else if (challenge.status === "ended") {
      const finalSnapshot = finalSnapshots.get(participant.userId);
      currentValue = metricValue(
        finalSnapshot ? snapshotStats(finalSnapshot) : userStats(participant.user),
        challenge.metric,
      );
      delta = currentValue == null || baselineValue == null ? null : currentValue - baselineValue;
    }

    return {
      id: participant.id,
      userId: participant.userId,
      name: participant.user.name,
      username: participant.user.leetcodeUsername,
      profileHref: profileHref(participant.user),
      joinedAt: participant.joinedAt,
      baselineKind,
      baselineValue,
      currentValue,
      delta,
      finalized,
    };
  });

  return rankChallengeStandings(rows);
}

export function metricShortLabel(metric: ChallengeMetricValue): string {
  return CHALLENGE_METRIC_SHORT_LABELS[metric];
}
