import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle02Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionLabel } from "@/components/marketing/section-label";
import { LeetCodeStats } from "@/components/dashboard/leetcode-stats";
import type { LeetCodeBadge } from "@/lib/leetcode";
import { getUniversityRank, normalizePublicHandle, parseLeetCodeBadges } from "@/lib/users/profiles";
import { PublicProfileControls } from "@/components/dashboard/public-profile-controls";
import { Button } from "@/components/ui/button";

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
  const badges: LeetCodeBadge[] = parseLeetCodeBadges(user.leetcodeBadges);
  const universityRank = await getUniversityRank(user.universityId, user.leetcodeTotalSolved);
  const profileHandle = user.publicProfileHandle ?? normalizePublicHandle(user.leetcodeUsername ?? "");
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
      <header className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4">
            <SectionLabel>Your dashboard</SectionLabel>
            <div>
              <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
                Welcome back, {firstName(user.name)}.
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5 text-gold" />
                  @{user.leetcodeUsername} verified
                </span>
                {user.university ? <span>{user.university.name}</span> : null}
              </div>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">Campus rank</div>
            <div className="mt-1 font-mono text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {universityRank == null ? "—" : `#${universityRank}`}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <PublicProfileControls enabled={user.publicProfileEnabled} handle={profileHandle} />
          <Button variant="ghost" nativeButton={false} render={<Link href={`/compare?left=${profileHandle}`} />}>
            <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} />
            Compare profiles
          </Button>
        </div>
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
