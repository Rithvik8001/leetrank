import { headers } from "next/headers";
import type { GroupRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ClubGate = { userId: string; role: GroupRole; group: { id: string; kind: "CASUAL" | "OFFICIAL_CLUB"; slug: string | null; suspendedAt: Date | null; ownerId: string; universityId: string | null } };

export async function getCurrentDbUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, platformRole: true, universityId: true, leetcodeVerified: true } });
}

export async function requirePlatformAdmin() {
  const user = await getCurrentDbUser();
  return user?.platformRole === "ADMIN" ? user : null;
}

export async function getClubGate(groupId: string, roles?: GroupRole[]): Promise<ClubGate | null> {
  const user = await getCurrentDbUser();
  if (!user) return null;
  const membership = await prisma.groupMembership.findFirst({
    where: { groupId, userId: user.id, status: "ACTIVE", ...(roles ? { role: { in: roles } } : {}) },
    select: { role: true, group: { select: { id: true, kind: true, slug: true, suspendedAt: true, ownerId: true, universityId: true } } },
  });
  return membership ? { userId: user.id, role: membership.role, group: membership.group } : null;
}

