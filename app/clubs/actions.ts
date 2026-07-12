"use server";

import { revalidatePath } from "next/cache";
import type { GroupRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getClubGate, getCurrentDbUser } from "@/lib/clubs/auth";
import { recordAudit } from "@/lib/clubs/audit";
import {
  canAdminClub,
  canChangeRole,
  canManageMembers,
  canPublishAnnouncement,
} from "@/lib/clubs/permissions";
import {
  announcementSchema,
  clubApplicationSchema,
  clubProfileSchema,
  memberDecisionSchema,
  memberRemovalSchema,
  membershipApplicationSchema,
  type AnnouncementValues,
  type ClubApplicationValues,
  type ClubProfileValues,
} from "@/lib/clubs/schemas";
import {
  CLUB_APPLICATION_MIN_MEMBERS,
  CLUB_REAPPLICATION_DAYS,
  MAX_CLUB_MEMBERS,
} from "@/lib/clubs/constants";

export type ClubActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };
const err = (error: string): ClubActionResult => ({ ok: false, error });
function refresh(groupId: string, slug?: string | null) {
  revalidatePath("/clubs");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/admin`);
  revalidatePath(`/groups/${groupId}/announcements`);
  if (slug) revalidatePath(`/clubs/${slug}`);
}

export async function submitClubApplication(
  groupId: string,
  values: ClubApplicationValues,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId, ["OWNER"]);
  if (!gate) return err("Only the group owner can apply.");
  const user = await getCurrentDbUser();
  if (!user?.leetcodeVerified || !user.universityId)
    return err("Complete university and LeetCode verification first.");
  const parsed = clubApplicationSchema.safeParse(values);
  if (!parsed.success)
    return err(parsed.error.issues[0]?.message ?? "Invalid application.");
  const [group, active, slugUsed] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        kind: true,
        clubApplications: {
          where: { status: { in: ["PENDING", "CHANGES_REQUESTED"] } },
          take: 1,
          select: { id: true },
        },
      },
    }),
    prisma.groupMembership.findMany({
      where: { groupId, status: "ACTIVE" },
      select: { user: { select: { universityId: true } } },
    }),
    prisma.group.findFirst({
      where: { slug: parsed.data.requestedSlug },
      select: { id: true },
    }),
  ]);
  if (!group || group.kind !== "CASUAL")
    return err("This group is already an official club.");
  if (group.clubApplications.length)
    return err("This group already has an active application.");
  if (active.length < CLUB_APPLICATION_MIN_MEMBERS)
    return err(
      `Add at least ${CLUB_APPLICATION_MIN_MEMBERS} members before applying.`,
    );
  if (active.some((m) => m.user.universityId !== user.universityId))
    return err("All active members must belong to your university.");
  if (slugUsed) return err("That club URL is already taken.");
  await prisma.$transaction(async (tx) => {
    const application = await tx.clubApplication.create({
      data: {
        id: crypto.randomUUID(),
        groupId,
        submittedById: user.id,
        universityId: user.universityId!,
        ...parsed.data,
      },
    });
    await recordAudit(tx, {
      actorId: user.id,
      groupId,
      action: "club.application.submitted",
      targetType: "ClubApplication",
      targetId: application.id,
    });
  });
  refresh(groupId);
  return { ok: true };
}

export async function withdrawClubApplication(
  groupId: string,
  applicationId: string,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId, ["OWNER"]);
  if (!gate) return err("Only the group owner can withdraw this application.");
  const updated = await prisma.clubApplication.updateMany({
    where: {
      id: applicationId,
      groupId,
      status: { in: ["PENDING", "CHANGES_REQUESTED"] },
    },
    data: { status: "WITHDRAWN" },
  });
  if (!updated.count)
    return err("That application can no longer be withdrawn.");
  await recordAudit(prisma, {
    actorId: gate.userId,
    groupId,
    action: "club.application.withdrawn",
    targetType: "ClubApplication",
    targetId: applicationId,
  });
  refresh(groupId);
  return { ok: true };
}

export async function applyToClub(
  groupId: string,
  message: string,
): Promise<ClubActionResult> {
  const user = await getCurrentDbUser();
  if (!user?.leetcodeVerified || !user.universityId)
    return err("Verify your LeetCode account and university first.");
  const parsed = membershipApplicationSchema.safeParse({ message });
  if (!parsed.success)
    return err(parsed.error.issues[0]?.message ?? "Invalid application.");
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      kind: true,
      slug: true,
      suspendedAt: true,
      universityId: true,
      _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
    },
  });
  if (!group || group.kind !== "OFFICIAL_CLUB" || group.suspendedAt)
    return err("This club is not accepting applications.");
  if (group.universityId !== user.universityId)
    return err("This club is limited to students at its university.");
  if (group._count.memberships >= MAX_CLUB_MEMBERS)
    return err("This club is full.");
  const membership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
    select: { status: true },
  });
  if (membership?.status === "ACTIVE") return { ok: true } as ClubActionResult;
  if (membership?.status === "BLOCKED")
    return err("You cannot apply to this club.");
  const previous = await prisma.clubMembershipApplication.findFirst({
    where: { groupId, userId: user.id },
    orderBy: { submittedAt: "desc" },
  });
  if (previous?.status === "PENDING") return { ok: true } as ClubActionResult;
  if (
    previous?.status === "REJECTED" &&
    previous.submittedAt >
      new Date(Date.now() - CLUB_REAPPLICATION_DAYS * 86400000)
  )
    return err("You can reapply seven days after a rejection.");
  await prisma.clubMembershipApplication.create({
    data: {
      id: crypto.randomUUID(),
      groupId,
      userId: user.id,
      message: parsed.data.message || null,
    },
  });
  refresh(groupId, group.slug);
  return { ok: true };
}

export async function withdrawClubMembershipApplication(
  groupId: string,
): Promise<ClubActionResult> {
  const user = await getCurrentDbUser();
  if (!user) return err("Log in first.");
  const result = await prisma.clubMembershipApplication.updateMany({
    where: { groupId, userId: user.id, status: "PENDING" },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
  });
  if (!result.count) return err("No pending application found.");
  refresh(groupId);
  return { ok: true };
}

export async function decideClubMember(
  groupId: string,
  applicationId: string,
  decision: "APPROVED" | "REJECTED",
  note = "",
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (!gate || !canAdminClub(gate.role))
    return err("You cannot review applications.");
  const parsed = memberDecisionSchema.safeParse({ note });
  if (!parsed.success) return err("Invalid review note.");
  const application = await prisma.clubMembershipApplication.findFirst({
    where: { id: applicationId, groupId, status: "PENDING" },
    select: { userId: true, user: { select: { universityId: true } } },
  });
  if (!application) return err("That application has already been reviewed.");
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      universityId: true,
      suspendedAt: true,
      slug: true,
      _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
    },
  });
  if (!group || group.suspendedAt) return err("This club is suspended.");
  if (
    decision === "APPROVED" &&
    (application.user.universityId !== group.universityId ||
      group._count.memberships >= MAX_CLUB_MEMBERS)
  )
    return err("The applicant is no longer eligible or the club is full.");
  await prisma.$transaction(async (tx) => {
    const changed = await tx.clubMembershipApplication.updateMany({
      where: { id: applicationId, status: "PENDING" },
      data: {
        status: decision,
        reviewedAt: new Date(),
        reviewedById: gate.userId,
        reviewNote: parsed.data.note || null,
      },
    });
    if (!changed.count) throw new Error("Application already reviewed");
    if (decision === "APPROVED")
      await tx.groupMembership.upsert({
        where: { groupId_userId: { groupId, userId: application.userId } },
        create: {
          id: crypto.randomUUID(),
          groupId,
          userId: application.userId,
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
    await recordAudit(tx, {
      actorId: gate.userId,
      groupId,
      action: `club.membership.${decision.toLowerCase()}`,
      targetType: "ClubMembershipApplication",
      targetId: applicationId,
      metadata: { userId: application.userId },
    });
  });
  refresh(groupId, group.slug);
  return { ok: true };
}

export async function changeClubMemberRole(
  groupId: string,
  userId: string,
  role: Exclude<GroupRole, "OWNER">,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (!gate) return err("Not authorized.");
  if (gate.group.suspendedAt) return err("This club is suspended.");
  const member = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true, status: true },
  });
  if (
    !member ||
    member.status !== "ACTIVE" ||
    !canChangeRole(gate.role, member.role, role)
  )
    return err("You cannot make that role change.");
  await prisma.$transaction(async (tx) => {
    await tx.groupMembership.update({
      where: { groupId_userId: { groupId, userId } },
      data: { role },
    });
    await recordAudit(tx, {
      actorId: gate.userId,
      groupId,
      action: "club.member.role_changed",
      targetType: "User",
      targetId: userId,
      metadata: { from: member.role, to: role },
    });
  });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}

export async function removeClubMember(
  groupId: string,
  userId: string,
  reason: string,
  block = false,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (!gate || !canManageMembers(gate.role))
    return err("You cannot remove members.");
  if (gate.group.suspendedAt) return err("This club is suspended.");
  if (userId === gate.group.ownerId)
    return err("Transfer ownership before removing the owner.");
  const parsed = memberRemovalSchema.safeParse({ reason });
  if (!parsed.success)
    return err(parsed.error.issues[0]?.message ?? "Give a reason.");
  await prisma.$transaction(async (tx) => {
    await tx.groupMembership.updateMany({
      where: { groupId, userId, status: "ACTIVE", role: { not: "OWNER" } },
      data: {
        status: block ? "BLOCKED" : "REMOVED",
        endedAt: new Date(),
        removedById: gate.userId,
        removalReason: parsed.data.reason,
      },
    });
    await recordAudit(tx, {
      actorId: gate.userId,
      groupId,
      action: block ? "club.member.blocked" : "club.member.removed",
      targetType: "User",
      targetId: userId,
    });
  });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}

export async function transferClubOwnership(
  groupId: string,
  targetUserId: string,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId, ["OWNER"]);
  if (!gate) return err("Only the owner can transfer ownership.");
  if (gate.group.suspendedAt) return err("This club is suspended.");
  const target = await prisma.groupMembership.findFirst({
    where: { groupId, userId: targetUserId, status: "ACTIVE", role: "ADMIN" },
  });
  if (!target) return err("Ownership can only transfer to an active admin.");
  await prisma.$transaction(async (tx) => {
    await tx.group.update({
      where: { id: groupId },
      data: { ownerId: targetUserId },
    });
    await tx.groupMembership.update({
      where: { groupId_userId: { groupId, userId: gate.userId } },
      data: { role: "ADMIN" },
    });
    await tx.groupMembership.update({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      data: { role: "OWNER" },
    });
    await recordAudit(tx, {
      actorId: gate.userId,
      groupId,
      action: "club.ownership.transferred",
      targetType: "User",
      targetId: targetUserId,
    });
  });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}

export async function createClubAnnouncement(
  groupId: string,
  values: AnnouncementValues,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (!gate || !canPublishAnnouncement(gate.role) || gate.group.suspendedAt)
    return err("You cannot publish announcements.");
  const parsed = announcementSchema.safeParse(values);
  if (!parsed.success)
    return err(parsed.error.issues[0]?.message ?? "Invalid announcement.");
  await prisma.$transaction(async (tx) => {
    const item = await tx.clubAnnouncement.create({
      data: {
        id: crypto.randomUUID(),
        groupId,
        authorId: gate.userId,
        ...parsed.data,
      },
    });
    await recordAudit(tx, {
      actorId: gate.userId,
      groupId,
      action: "club.announcement.created",
      targetType: "ClubAnnouncement",
      targetId: item.id,
    });
  });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}

export async function archiveClubAnnouncement(
  groupId: string,
  announcementId: string,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (!gate || !canPublishAnnouncement(gate.role))
    return err("Not authorized.");
  await prisma.clubAnnouncement.updateMany({
    where: { id: announcementId, groupId },
    data: { archivedAt: new Date() },
  });
  await recordAudit(prisma, {
    actorId: gate.userId,
    groupId,
    action: "club.announcement.archived",
    targetType: "ClubAnnouncement",
    targetId: announcementId,
  });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}

export async function updateClubProfile(
  groupId: string,
  values: ClubProfileValues,
): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (
    !gate ||
    !canManageMembers(gate.role) ||
    gate.group.kind !== "OFFICIAL_CLUB" ||
    gate.group.suspendedAt
  )
    return err("You cannot edit this club.");
  const parsed = clubProfileSchema.safeParse(values);
  if (!parsed.success)
    return err(parsed.error.issues[0]?.message ?? "Invalid profile.");
  await prisma.group.update({
    where: { id: groupId },
    data: parsed.data,
  });
  await recordAudit(prisma, {
    actorId: gate.userId,
    groupId,
    action: "club.profile.updated",
    targetType: "Group",
    targetId: groupId,
  });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}

export async function approveClubMember(groupId: string, applicationId: string, note = "") { return decideClubMember(groupId, applicationId, "APPROVED", note); }
export async function rejectClubMember(groupId: string, applicationId: string, note = "") { return decideClubMember(groupId, applicationId, "REJECTED", note); }
export async function blockClubMember(groupId: string, userId: string, reason: string) { return removeClubMember(groupId, userId, reason, true); }

export async function updateClubAnnouncement(groupId: string, announcementId: string, values: AnnouncementValues): Promise<ClubActionResult> {
  const gate = await getClubGate(groupId);
  if (!gate || !canPublishAnnouncement(gate.role) || gate.group.suspendedAt) return err("You cannot edit announcements.");
  const parsed = announcementSchema.safeParse(values);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid announcement.");
  const changed = await prisma.clubAnnouncement.updateMany({ where: { id: announcementId, groupId, archivedAt: null }, data: parsed.data });
  if (!changed.count) return err("Announcement not found.");
  await recordAudit(prisma, { actorId: gate.userId, groupId, action: "club.announcement.updated", targetType: "ClubAnnouncement", targetId: announcementId });
  refresh(groupId, gate.group.slug);
  return { ok: true };
}
