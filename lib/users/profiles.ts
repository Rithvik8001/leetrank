import type { Prisma } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { LeetCodeBadge } from "@/lib/leetcode";

export const PROFILE_SEARCH_MIN_LENGTH = 2;
export const PROFILE_SEARCH_MAX_LENGTH = 50;
export const PROFILE_SEARCH_LIMIT = 8;

export type ProfileSuggestion = {
  handle: string;
  leetcodeUsername: string;
  name: string;
  universityName: string | null;
};

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

export const verifiedProfileSelect = {
  id: true,
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
  publicProfileHandle: true,
  publicProfileEnabled: true,
  university: { select: { name: true, slug: true, city: true, state: true } },
} satisfies Prisma.UserSelect;

export const getPublicProfile = cache(async function getPublicProfile(handle: string) {
  const user = await prisma.user.findFirst({
    where: {
      publicProfileHandle: normalizePublicHandle(handle),
      publicProfileEnabled: true,
      leetcodeVerified: true,
    },
    select: verifiedProfileSelect,
  });
  if (!user) return null;
  return {
    ...user,
    badges: parseLeetCodeBadges(user.leetcodeBadges),
    universityRank: await getUniversityRank(user.universityId, user.leetcodeTotalSolved),
  };
});

export function comparisonVisibilityFilter(publicOnly: boolean) {
  return {
    leetcodeVerified: true,
    ...(publicOnly ? { publicProfileEnabled: true } : {}),
  } as const;
}

export function normalizeProfileSearchQuery(query: string): string {
  return normalizePublicHandle(query).slice(0, PROFILE_SEARCH_MAX_LENGTH);
}

export function toProfileSuggestion(profile: {
  name: string;
  leetcodeUsername: string | null;
  publicProfileHandle: string | null;
  university: { name: string } | null;
}): ProfileSuggestion | null {
  if (!profile.leetcodeUsername || !profile.publicProfileHandle) return null;
  return {
    handle: profile.publicProfileHandle,
    leetcodeUsername: profile.leetcodeUsername,
    name: profile.name,
    universityName: profile.university?.name ?? null,
  };
}

export async function searchComparableProfiles(
  query: string,
  publicOnly: boolean,
): Promise<ProfileSuggestion[]> {
  const normalized = normalizeProfileSearchQuery(query);
  if (normalized.length < PROFILE_SEARCH_MIN_LENGTH) return [];

  const profiles = await prisma.user.findMany({
    where: {
      publicProfileHandle: { startsWith: normalized },
      ...comparisonVisibilityFilter(publicOnly),
    },
    select: {
      name: true,
      leetcodeUsername: true,
      publicProfileHandle: true,
      university: { select: { name: true } },
    },
    orderBy: { publicProfileHandle: "asc" },
    take: PROFILE_SEARCH_LIMIT,
  });

  return profiles.flatMap((profile) => {
    const suggestion = toProfileSuggestion(profile);
    return suggestion ? [suggestion] : [];
  });
}

export async function getComparableProfile(handle: string, publicOnly: boolean) {
  const user = await prisma.user.findFirst({
    where: {
      publicProfileHandle: normalizePublicHandle(handle),
      ...comparisonVisibilityFilter(publicOnly),
    },
    select: verifiedProfileSelect,
  });
  if (!user) return null;
  return {
    ...user,
    universityRank: await getUniversityRank(user.universityId, user.leetcodeTotalSolved),
  };
}

export async function getComparableProfileForUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, leetcodeVerified: true },
    select: verifiedProfileSelect,
  });
  if (!user) return null;
  return {
    ...user,
    universityRank: await getUniversityRank(user.universityId, user.leetcodeTotalSolved),
  };
}
