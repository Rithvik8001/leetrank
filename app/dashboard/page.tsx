import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionLabel } from "@/components/marketing/section-label";
import { LeetCodeStats } from "@/components/dashboard/leetcode-stats";
import type { LeetCodeBadge } from "@/lib/leetcode";

function firstName(name: string) {
  return name.trim().split(" ")[0] || name;
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { university: true },
  });
  if (!user) {
    redirect("/login");
  }

  const formatNumber = (value: number | null) =>
    value == null ? "—" : value.toLocaleString();
  const badges = Array.isArray(user.leetcodeBadges)
    ? (user.leetcodeBadges as unknown as LeetCodeBadge[])
    : [];
  const stats = [
    { label: "Problems solved", value: formatNumber(user.leetcodeTotalSolved) },
    { label: "Easy", value: formatNumber(user.leetcodeEasySolved) },
    { label: "Medium", value: formatNumber(user.leetcodeMediumSolved) },
    { label: "Hard", value: formatNumber(user.leetcodeHardSolved) },
    {
      label: "Global rank",
      value: user.leetcodeRanking == null ? "—" : `#${formatNumber(user.leetcodeRanking)}`,
    },
    {
      label: "Contest rating",
      value:
        user.leetcodeContestRating == null
          ? "—"
          : Math.round(user.leetcodeContestRating).toLocaleString(),
    },
    {
      label: "Contest global",
      value:
        user.leetcodeContestGlobalRanking == null
          ? "—"
          : `#${formatNumber(user.leetcodeContestGlobalRanking)}`,
    },
  ];

  return (
    <div className="flex flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4">
        <SectionLabel>Your dashboard</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
          Welcome back, {firstName(user.name)}.
        </h1>
        {user.university ? (
          <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground">
            Ranked at {user.university.name}
          </p>
        ) : null}
      </header>

      {user.leetcodeUsername ? (
        <LeetCodeStats
          username={user.leetcodeUsername}
          status={user.leetcodeSyncStatus}
          error={user.leetcodeSyncError}
          lastSyncedAt={user.leetcodeLastSyncedAt?.toISOString() ?? null}
          lastAttemptAt={user.leetcodeLastSyncAttemptAt?.toISOString() ?? null}
          stats={stats}
          badges={badges}
        />
      ) : null}

      {user.university ? (
        <Link
          href={`/universities/${user.university.slug}`}
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-foreground"
        >
          View your university&apos;s leaderboard
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}
