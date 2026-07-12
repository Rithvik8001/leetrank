"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/clubs/auth";
import { recordAudit } from "@/lib/clubs/audit";
import { reviewSchema } from "@/lib/clubs/schemas";

type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
function refresh(groupId: string, slug?: string | null) {
  revalidatePath("/admin/clubs");
  revalidatePath("/clubs");
  revalidatePath(`/groups/${groupId}`);
  if (slug) revalidatePath(`/clubs/${slug}`);
}

export async function reviewClubApplication(
  applicationId: string,
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
  note: string,
): Promise<Result> {
  const admin = await requirePlatformAdmin();
  if (!admin) return fail("Platform admin access required.");
  if (decision !== "APPROVED") {
    const p = reviewSchema.safeParse({ note });
    if (!p.success)
      return fail(p.error.issues[0]?.message ?? "A review note is required.");
    note = p.data.note;
  }
  const application = await prisma.clubApplication.findFirst({
    where: {
      id: applicationId,
      status: { in: ["PENDING", "CHANGES_REQUESTED"] },
    },
    include: {
      group: {
        include: {
          memberships: {
            where: { status: "ACTIVE" },
            include: { user: { select: { universityId: true } } },
          },
        },
      },
    },
  });
  if (!application) return fail("That application has already been reviewed.");
  if (decision === "APPROVED") {
    if (
      application.group.memberships.some(
        (m) => m.user.universityId !== application.universityId,
      )
    )
      return fail("The active roster no longer matches the university.");
    const slug = await prisma.group.findFirst({
      where: {
        slug: application.requestedSlug,
        id: { not: application.groupId },
      },
    });
    if (slug) return fail("The requested club URL is no longer available.");
  }
  await prisma.$transaction(async (tx) => {
    const changed = await tx.clubApplication.updateMany({
      where: {
        id: applicationId,
        status: { in: ["PENDING", "CHANGES_REQUESTED"] },
      },
      data: {
        status: decision,
        reviewedAt: new Date(),
        reviewedById: admin.id,
        reviewNote: note || null,
      },
    });
    if (!changed.count) throw new Error("Application already reviewed");
    if (decision === "APPROVED") {
      await tx.group.update({
        where: { id: application.groupId },
        data: {
          kind: "OFFICIAL_CLUB",
          universityId: application.universityId,
          slug: application.requestedSlug,
          name: application.proposedName,
          description: application.description,
          contactEmail: application.contactEmail,
          websiteUrl: application.officialWebsiteUrl,
          githubUrl: application.githubUrl,
          discordUrl: application.discordUrl,
          approvedAt: new Date(),
          approvedById: admin.id,
        },
      });
      await tx.groupMembership.update({
        where: {
          groupId_userId: {
            groupId: application.groupId,
            userId: application.group.ownerId,
          },
        },
        data: { role: "OWNER", status: "ACTIVE" },
      });
    }
    await recordAudit(tx, {
      actorId: admin.id,
      groupId: application.groupId,
      action: `club.application.${decision.toLowerCase()}`,
      targetType: "ClubApplication",
      targetId: applicationId,
    });
  });
  refresh(
    application.groupId,
    decision === "APPROVED" ? application.requestedSlug : null,
  );
  return { ok: true };
}

export async function setClubSuspension(
  groupId: string,
  suspended: boolean,
  reason: string,
): Promise<Result> {
  const admin = await requirePlatformAdmin();
  if (!admin) return fail("Platform admin access required.");
  if (suspended) {
    const p = reviewSchema.safeParse({ note: reason });
    if (!p.success) return fail("A suspension reason is required.");
    reason = p.data.note;
  }
  const group = await prisma.group.findFirst({
    where: { id: groupId, kind: "OFFICIAL_CLUB" },
    select: { slug: true },
  });
  if (!group) return fail("Club not found.");
  await prisma.$transaction(async (tx) => {
    await tx.group.update({
      where: { id: groupId },
      data: {
        suspendedAt: suspended ? new Date() : null,
        suspensionReason: suspended ? reason : null,
      },
    });
    await recordAudit(tx, {
      actorId: admin.id,
      groupId,
      action: suspended ? "club.suspended" : "club.reactivated",
      targetType: "Group",
      targetId: groupId,
    });
  });
  refresh(groupId, group.slug);
  return { ok: true };
}

export async function requestClubApplicationChanges(
  applicationId: string,
  note: string,
) {
  return reviewClubApplication(applicationId, "CHANGES_REQUESTED", note);
}
export async function approveClubApplication(applicationId: string) {
  return reviewClubApplication(applicationId, "APPROVED", "");
}
export async function rejectClubApplication(
  applicationId: string,
  note: string,
) {
  return reviewClubApplication(applicationId, "REJECTED", note);
}
export async function suspendOfficialClub(groupId: string, reason: string) {
  return setClubSuspension(groupId, true, reason);
}
export async function reactivateOfficialClub(groupId: string) {
  return setClubSuspension(groupId, false, "");
}
