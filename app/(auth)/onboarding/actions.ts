"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  selectUniversitySchema,
  leetcodeUsernameSchema,
} from "@/lib/onboarding/schemas";
import {
  generateVerificationCode,
  VERIFICATION_CODE_TTL_MS,
} from "@/lib/onboarding/verification-code";
import {
  fetchLeetCodePublicProfile,
  bioContainsCode,
  LeetCodeProfileNotFoundError,
  LeetCodeRateLimitedError,
  LeetCodeFetchError,
} from "@/lib/leetcode";
import { profileStatsData } from "@/lib/leetcode-sync";
import { normalizePublicHandle } from "@/lib/users/profiles";
import { LeetcodeSyncStatus } from "@prisma/client";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
}

export async function selectUniversity(
  universityId: string,
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = selectUniversitySchema.safeParse({ universityId });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid university" };
  }

  const university = await prisma.university.findUnique({
    where: { id: parsed.data.universityId },
  });
  if (!university) {
    return { ok: false, error: "That university couldn't be found." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { universityId: university.id },
  });

  return { ok: true };
}

export async function setLeetcodeUsernameAndGenerateCode(
  username: string,
): Promise<ActionResult<{ code: string }>> {
  const session = await requireSession();

  const parsed = leetcodeUsernameSchema.safeParse({ username });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid username" };
  }

  const existing = await prisma.user.findUnique({
    where: { leetcodeUsername: parsed.data.username },
  });
  if (existing && existing.id !== session.user.id) {
    return {
      ok: false,
      error: "That LeetCode account is already linked to another LeetRank account.",
    };
  }

  const code = generateVerificationCode();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      leetcodeUsername: parsed.data.username,
      leetcodeVerificationCode: code,
      leetcodeVerificationCodeExpiresAt: new Date(
        Date.now() + VERIFICATION_CODE_TTL_MS,
      ),
    },
  });

  return { ok: true, data: { code } };
}

export async function verifyLeetcodeBio(): Promise<ActionResult> {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.leetcodeUsername || !user.leetcodeVerificationCode) {
    return { ok: false, error: "Set your LeetCode username first." };
  }
  if (
    user.leetcodeVerificationCodeExpiresAt &&
    user.leetcodeVerificationCodeExpiresAt.getTime() < Date.now()
  ) {
    return {
      ok: false,
      error: "Your verification code expired. Generate a new one.",
    };
  }

  let profile;
  try {
    profile = await fetchLeetCodePublicProfile(user.leetcodeUsername);
  } catch (error) {
    if (error instanceof LeetCodeProfileNotFoundError) {
      return { ok: false, error: "We couldn't find that LeetCode profile." };
    }
    if (error instanceof LeetCodeRateLimitedError) {
      return {
        ok: false,
        error: "LeetCode is rate-limiting us right now — try again in a minute.",
      };
    }
    if (error instanceof LeetCodeFetchError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  if (!bioContainsCode(profile.aboutMe, user.leetcodeVerificationCode)) {
    return {
      ok: false,
      error:
        "We didn't find your code yet — make sure you saved your LeetCode bio, then try again.",
    };
  }

  const syncedAt = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      leetcodeVerified: true,
      leetcodeVerifiedAt: new Date(),
      leetcodeVerificationCode: null,
      leetcodeVerificationCodeExpiresAt: null,
      leetcodeUsername: profile.username,
      publicProfileHandle: normalizePublicHandle(profile.username),
      ...profileStatsData(profile),
      leetcodeSyncStatus: LeetcodeSyncStatus.SUCCESS,
      leetcodeSyncError: null,
      leetcodeLastSyncAttemptAt: syncedAt,
      leetcodeLastSyncedAt: syncedAt,
    },
  });

  return { ok: true };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.universityId || !user.leetcodeVerified) {
    return { ok: false, error: "Finish the earlier onboarding steps first." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingCompletedAt: new Date() },
  });

  await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  return { ok: true };
}
