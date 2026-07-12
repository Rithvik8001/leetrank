"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupNameSchema } from "@/lib/groups/schemas";
import { generateInviteToken } from "@/lib/groups/invite-token";
import { MAX_GROUP_MEMBERS, MAX_OWNED_GROUPS } from "@/lib/groups/constants";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

// Verified users only may create or join groups (members-only-verified rule).
async function requireVerifiedUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Log in to manage groups." };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, leetcodeVerified: true },
  });
  if (!user) return { ok: false, error: "Log in to manage groups." };
  if (!user.leetcodeVerified) {
    return { ok: false, error: "Verify your LeetCode account first." };
  }
  return { ok: true, userId: user.id };
}

export async function createGroup(
  name: string,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireVerifiedUser();
  if (!gate.ok) return gate;

  const parsed = groupNameSchema.safeParse({ name });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid group name",
    };
  }

  const owned = await prisma.group.count({ where: { ownerId: gate.userId } });
  if (owned >= MAX_OWNED_GROUPS) {
    return {
      ok: false,
      error: `You can own up to ${MAX_OWNED_GROUPS} groups.`,
    };
  }

  const group = await prisma.group.create({
    data: {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      ownerId: gate.userId,
      inviteToken: generateInviteToken(),
      memberships: {
        create: { id: crypto.randomUUID(), userId: gate.userId, role: "OWNER" },
      },
    },
    select: { id: true },
  });

  revalidatePath("/groups");
  return { ok: true, data: { id: group.id } };
}

export async function joinGroup(
  token: string,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireVerifiedUser();
  if (!gate.ok) return gate;

  const group = await prisma.group.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      kind: true,
      _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
    },
  });
  if (!group) {
    return { ok: false, error: "That invite link is no longer valid." };
  }
  if (group.kind === "OFFICIAL_CLUB")
    return { ok: false, error: "Official clubs use membership applications." };

  const already = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: gate.userId } },
    select: { id: true, status: true },
  });
  if (already?.status === "ACTIVE") return { ok: true, data: { id: group.id } };

  if (group._count.memberships >= MAX_GROUP_MEMBERS) {
    return { ok: false, error: "This group is full." };
  }

  try {
    await prisma.groupMembership.upsert({
      where: { groupId_userId: { groupId: group.id, userId: gate.userId } },
      create: {
        id: crypto.randomUUID(),
        groupId: group.id,
        userId: gate.userId,
      },
      update: {
        status: "ACTIVE",
        role: "MEMBER",
        endedAt: null,
        removalReason: null,
        removedById: null,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Unique-constraint race → treat as already a member.
    if (!(
      error instanceof Error && error.message.includes("Unique constraint")
    )) {
      throw error;
    }
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${group.id}`);
  return { ok: true, data: { id: group.id } };
}

export async function leaveGroup(groupId: string): Promise<ActionResult> {
  const gate = await requireVerifiedUser();
  if (!gate.ok) return gate;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  });
  if (!group) return { ok: false, error: "That group no longer exists." };
  if (group.ownerId === gate.userId) {
    return {
      ok: false,
      error: "Owners can't leave — delete the group instead.",
    };
  }

  await prisma.groupMembership.updateMany({
    where: { groupId, userId: gate.userId, status: "ACTIVE" },
    data: { status: "LEFT", endedAt: new Date() },
  });

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  return { ok: true };
}

// Owner-only guard shared by management actions.
async function requireOwner(
  groupId: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const gate = await requireVerifiedUser();
  if (!gate.ok) return gate;
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  });
  if (!group) return { ok: false, error: "That group no longer exists." };
  if (group.ownerId !== gate.userId) {
    return { ok: false, error: "Only the group owner can do that." };
  }
  return { ok: true, userId: gate.userId };
}

export async function removeMember(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const owner = await requireOwner(groupId);
  if (!owner.ok) return owner;
  if (userId === owner.userId) {
    return { ok: false, error: "You can't remove yourself as the owner." };
  }

  await prisma.groupMembership.updateMany({
    where: { groupId, userId, status: "ACTIVE" },
    data: {
      status: "REMOVED",
      endedAt: new Date(),
      removedById: owner.userId,
      removalReason: "Removed by group owner",
    },
  });

  revalidatePath(`/groups/${groupId}`);
  return { ok: true };
}

export async function renameGroup(
  groupId: string,
  name: string,
): Promise<ActionResult> {
  const owner = await requireOwner(groupId);
  if (!owner.ok) return owner;

  const parsed = groupNameSchema.safeParse({ name });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid group name",
    };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { kind: true },
  });
  if (group?.kind === "OFFICIAL_CLUB")
    return {
      ok: false,
      error: "Edit official club details from the admin dashboard.",
    };
  await prisma.group.update({
    where: { id: groupId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  return { ok: true };
}

export async function regenerateInvite(
  groupId: string,
): Promise<ActionResult<{ token: string }>> {
  const owner = await requireOwner(groupId);
  if (!owner.ok) return owner;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { kind: true },
  });
  if (group?.kind === "OFFICIAL_CLUB")
    return { ok: false, error: "Official clubs use membership applications." };
  const token = generateInviteToken();
  await prisma.group.update({
    where: { id: groupId },
    data: { inviteToken: token },
  });

  revalidatePath(`/groups/${groupId}`);
  return { ok: true, data: { token } };
}

export async function deleteGroup(groupId: string): Promise<ActionResult> {
  const owner = await requireOwner(groupId);
  if (!owner.ok) return owner;

  await prisma.group.delete({ where: { id: groupId } });

  revalidatePath("/groups");
  return { ok: true };
}
