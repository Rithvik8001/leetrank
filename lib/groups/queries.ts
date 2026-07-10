import { prisma } from "@/lib/prisma";
import { VERIFIED_LEADERBOARD_FILTER, type LeaderboardUser } from "@/lib/leaderboard";

// The exact projection the leaderboard engine needs (mirrors the university page).
const leaderboardUserSelect = {
  id: true,
  name: true,
  leetcodeUsername: true,
  leetcodeTotalSolved: true,
  leetcodeEasySolved: true,
  leetcodeMediumSolved: true,
  leetcodeHardSolved: true,
  leetcodeRanking: true,
  leetcodeContestRating: true,
  leetcodeLastSyncedAt: true,
  publicProfileEnabled: true,
  publicProfileHandle: true,
} as const;

export type UserGroupSummary = {
  id: string;
  name: string;
  memberCount: number;
  isOwner: boolean;
};

// Every group the user belongs to (owned or joined), newest first.
export async function getUserGroups(userId: string): Promise<UserGroupSummary[]> {
  const groups = await prisma.group.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, ownerId: true, _count: { select: { memberships: true } } },
  });
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    memberCount: group._count.memberships,
    isOwner: group.ownerId === userId,
  }));
}

export type GroupForMember = {
  id: string;
  name: string;
  ownerId: string;
  inviteToken: string;
  isOwner: boolean;
  members: { id: string; name: string; leetcodeUsername: string | null; isOwner: boolean }[];
};

// The group only if `userId` is a member — the access-control gate for the group
// page. Returns null otherwise (drives notFound()).
export async function getGroupForMember(
  groupId: string,
  userId: string,
): Promise<GroupForMember | null> {
  const group = await prisma.group.findFirst({
    where: { id: groupId, memberships: { some: { userId } } },
    select: {
      id: true,
      name: true,
      ownerId: true,
      inviteToken: true,
      memberships: {
        orderBy: { createdAt: "asc" },
        select: { user: { select: { id: true, name: true, leetcodeUsername: true } } },
      },
    },
  });
  if (!group) return null;
  return {
    id: group.id,
    name: group.name,
    ownerId: group.ownerId,
    inviteToken: group.inviteToken,
    isOwner: group.ownerId === userId,
    members: group.memberships.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      leetcodeUsername: membership.user.leetcodeUsername,
      isOwner: membership.user.id === group.ownerId,
    })),
  };
}

// Verified members of a group, projected for the leaderboard engine.
export async function getGroupMembers(groupId: string): Promise<LeaderboardUser[]> {
  return prisma.user.findMany({
    where: { groupMemberships: { some: { groupId } }, ...VERIFIED_LEADERBOARD_FILTER },
    select: leaderboardUserSelect,
  });
}

export type GroupInvitePreview = {
  id: string;
  name: string;
  memberCount: number;
};

// Minimal group info resolved from an invite token, for the public join page.
export async function getGroupByInviteToken(
  token: string,
): Promise<GroupInvitePreview | null> {
  const group = await prisma.group.findUnique({
    where: { inviteToken: token },
    select: { id: true, name: true, _count: { select: { memberships: true } } },
  });
  if (!group) return null;
  return { id: group.id, name: group.name, memberCount: group._count.memberships };
}

// Whether the user already belongs to the group (for the join page's CTA state).
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const membership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true },
  });
  return membership != null;
}
