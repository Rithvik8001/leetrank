"use server";

import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_ACTIVE_UPCOMING_CHALLENGES } from "@/lib/challenges/constants";
import { todayUtcDate } from "@/lib/challenges/dates";
import {
  challengeDates,
  challengeFormSchema,
  type ChallengeFormValues,
} from "@/lib/challenges/schemas";
import { getChallengeBaselineForUser } from "@/lib/challenges/queries";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function requireSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session.user.id;
}

async function requireGroupOwner(groupId: string): Promise<
  | { ok: true; userId: string; group: { id: string; ownerId: string } }
  | { ok: false; error: string }
> {
  const userId = await requireSessionUser();
  if (!userId) return { ok: false, error: "Log in to manage challenges." };
  const group = await prisma.group.findFirst({
    where: { id: groupId, ownerId: userId },
    select: { id: true, ownerId: true },
  });
  if (!group) return { ok: false, error: "Only the group owner can do that." };
  return { ok: true, userId, group };
}

async function requireVerifiedMember(groupId: string): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const userId = await requireSessionUser();
  if (!userId) return { ok: false, error: "Log in to join challenges." };
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      leetcodeVerified: true,
      groupMemberships: { some: { groupId } },
    },
    select: { id: true },
  });
  if (!user) {
    return {
      ok: false,
      error: "Join this group and verify your LeetCode account first.",
    };
  }
  return { ok: true, userId: user.id };
}

function revalidateChallengePaths(groupId: string, challengeId?: string) {
  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/challenges`);
  if (challengeId) revalidatePath(`/groups/${groupId}/challenges/${challengeId}`);
}

function parseChallengeValues(values: ChallengeFormValues) {
  const parsed = challengeFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check the challenge details." };
  }
  return { ok: true as const, values: parsed.data, ...challengeDates(parsed.data) };
}

export async function createGroupChallenge(
  groupId: string,
  values: ChallengeFormValues,
): Promise<ActionResult<{ id: string }>> {
  const owner = await requireGroupOwner(groupId);
  if (!owner.ok) return owner;

  const parsed = parseChallengeValues(values);
  if (!parsed.ok) return parsed;

  const today = todayUtcDate();
  if (parsed.startsOn.getTime() < today.getTime()) {
    return { ok: false, error: "Start date can't be in the past." };
  }

  const activeUpcoming = await prisma.groupChallenge.count({
    where: { groupId, endsOn: { gte: today } },
  });
  if (activeUpcoming >= MAX_ACTIVE_UPCOMING_CHALLENGES) {
    return {
      ok: false,
      error: `A group can have up to ${MAX_ACTIVE_UPCOMING_CHALLENGES} active or upcoming challenges.`,
    };
  }

  const challenge = await prisma.groupChallenge.create({
    data: {
      id: crypto.randomUUID(),
      groupId,
      createdById: owner.userId,
      title: parsed.values.title,
      description: parsed.values.description,
      metric: parsed.values.metric,
      startsOn: parsed.startsOn,
      endsOn: parsed.endsOn,
    },
    select: { id: true },
  });

  revalidateChallengePaths(groupId, challenge.id);
  return { ok: true, data: { id: challenge.id } };
}

export async function updateGroupChallenge(
  groupId: string,
  challengeId: string,
  values: ChallengeFormValues,
): Promise<ActionResult> {
  const owner = await requireGroupOwner(groupId);
  if (!owner.ok) return owner;

  const challenge = await prisma.groupChallenge.findFirst({
    where: { id: challengeId, groupId },
    select: { id: true, startsOn: true },
  });
  if (!challenge) return { ok: false, error: "That challenge no longer exists." };

  const today = todayUtcDate();
  if (challenge.startsOn.getTime() <= today.getTime()) {
    return { ok: false, error: "Started challenges can't be edited." };
  }

  const parsed = parseChallengeValues(values);
  if (!parsed.ok) return parsed;
  if (parsed.startsOn.getTime() < today.getTime()) {
    return { ok: false, error: "Start date can't be in the past." };
  }

  await prisma.groupChallenge.update({
    where: { id: challengeId },
    data: {
      title: parsed.values.title,
      description: parsed.values.description,
      metric: parsed.values.metric,
      startsOn: parsed.startsOn,
      endsOn: parsed.endsOn,
    },
  });

  revalidateChallengePaths(groupId, challengeId);
  return { ok: true };
}

export async function deleteGroupChallenge(
  groupId: string,
  challengeId: string,
): Promise<ActionResult> {
  const owner = await requireGroupOwner(groupId);
  if (!owner.ok) return owner;

  const challenge = await prisma.groupChallenge.findFirst({
    where: { id: challengeId, groupId },
    select: { id: true, startsOn: true },
  });
  if (!challenge) return { ok: false, error: "That challenge no longer exists." };
  if (challenge.startsOn.getTime() <= todayUtcDate().getTime()) {
    return { ok: false, error: "Started challenges can't be deleted." };
  }

  await prisma.groupChallenge.delete({ where: { id: challengeId } });
  revalidateChallengePaths(groupId);
  return { ok: true };
}

export async function joinChallenge(
  groupId: string,
  challengeId: string,
): Promise<ActionResult> {
  const member = await requireVerifiedMember(groupId);
  if (!member.ok) return member;

  const challenge = await prisma.groupChallenge.findFirst({
    where: { id: challengeId, groupId },
    select: { id: true, startsOn: true, endsOn: true },
  });
  if (!challenge) return { ok: false, error: "That challenge no longer exists." };
  if (challenge.endsOn.getTime() < todayUtcDate().getTime()) {
    return { ok: false, error: "This challenge has already ended." };
  }

  const existing = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId: member.userId } },
    select: { id: true },
  });
  if (existing) return { ok: true };

  const baseline = await getChallengeBaselineForUser(member.userId, challenge.startsOn);
  try {
    await prisma.challengeParticipant.create({
      data: {
        id: crypto.randomUUID(),
        challengeId,
        userId: member.userId,
        baselineKind: baseline?.kind ?? "PENDING",
        baselineTotalSolved: baseline?.totalSolved,
        baselineHardSolved: baseline?.hardSolved,
        baselineContestRating: baseline?.contestRating,
        baselineCapturedAt: baseline?.capturedAt,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  revalidateChallengePaths(groupId, challengeId);
  return { ok: true };
}

export async function leaveChallenge(
  groupId: string,
  challengeId: string,
): Promise<ActionResult> {
  const member = await requireVerifiedMember(groupId);
  if (!member.ok) return member;

  const challenge = await prisma.groupChallenge.findFirst({
    where: { id: challengeId, groupId },
    select: { id: true, startsOn: true },
  });
  if (!challenge) return { ok: false, error: "That challenge no longer exists." };
  if (challenge.startsOn.getTime() <= todayUtcDate().getTime()) {
    return { ok: false, error: "You can't leave a challenge after it starts." };
  }

  await prisma.challengeParticipant.deleteMany({
    where: { challengeId, userId: member.userId },
  });

  revalidateChallengePaths(groupId, challengeId);
  return { ok: true };
}
