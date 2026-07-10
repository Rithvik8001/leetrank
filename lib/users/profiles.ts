import type { Prisma } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { LeetCodeBadge } from "@/lib/leetcode";

export function normalizePublicHandle(username: string): string {
  return username.trim().toLowerCase();
}

export function competitionRank(aheadCount: number, totalSolved: number | null) {
  return totalSolved == null ? null : aheadCount + 1;
}

export function parseLeetCodeBadges(value: Prisma.JsonValue | null): LeetCodeBadge[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((badge) => {
    if (!badge || typeof badge !== "object" || Array.isArray(badge)) return [];
    if (typeof badge.id !== "string" || typeof badge.name !== "string") return [];
    return [{
      id: badge.id,
      name: badge.name,
      iconUrl: typeof badge.iconUrl === "string" ? badge.iconUrl : null,
      earnedAt: typeof badge.earnedAt === "string" ? badge.earnedAt : null,
    }];
  });
}

export async function getUniversityRank(
  universityId: string | null,
  totalSolved: number | null,
): Promise<number | null> {
  if (!universityId || totalSolved == null) return null;
  const ahead = await prisma.user.count({
    where: {
      universityId,
      leetcodeVerified: true,
      leetcodeTotalSolved: { gt: totalSolved },
    },
  });
  return competitionRank(ahead, totalSolved);
}

const publicProfileSelect = {
  name: true,
  leetcodeUsername: true,
  leetcodeVerified: true,
  leetcodeTotalSolved: true,
  leetcodeEasySolved: true,
  leetcodeMediumSolved: true,
  leetcodeHardSolved: true,
  leetcodeRanking: true,
  leetcodeContestRating: true,
  leetcodeContestGlobalRanking: true,
  leetcodeBadges: true,
  leetcodeLastSyncedAt: true,
  universityId: true,
  university: { select: { name: true, slug: true, city: true, state: true } },
} satisfies Prisma.UserSelect;

export const getPublicProfile = cache(async function getPublicProfile(handle: string) {
  const user = await prisma.user.findFirst({
    where: {
      publicProfileHandle: normalizePublicHandle(handle),
      publicProfileEnabled: true,
      leetcodeVerified: true,
    },
    select: publicProfileSelect,
  });
  if (!user) return null;
  return {
    ...user,
    badges: parseLeetCodeBadges(user.leetcodeBadges),
    universityRank: await getUniversityRank(user.universityId, user.leetcodeTotalSolved),
  };
});
