import Link from "next/link";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Globe02Icon } from "@hugeicons/core-free-icons";

import { prisma } from "@/lib/prisma";
import {
  LEADERBOARD_SORTS,
  VERIFIED_LEADERBOARD_FILTER,
  parseLeaderboardSort,
  rankLeaderboard,
} from "@/lib/leaderboard";
import { getUniversityInsights } from "@/lib/universities/insights";
import { getCampusActivityFeed } from "@/lib/activity/feed";
import { cn } from "@/lib/utils";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { SectionLabel } from "@/components/marketing/section-label";
import { LiveTag } from "@/components/standings";
import { UniversityInsights } from "@/components/universities/university-insights";
import { UniversityActivity } from "@/components/universities/university-activity";

const OWNERSHIP_LABEL: Record<string, string> = {
  PUBLIC: "Public",
  PRIVATE_NONPROFIT: "Private nonprofit",
  PRIVATE_FOR_PROFIT: "Private for-profit",
};

function number(value: number | null, prefix = "") {
  return value == null ? "—" : `${prefix}${value.toLocaleString()}`;
}

export default async function UniversityProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort: requestedSort } = await searchParams;
  const sort = parseLeaderboardSort(requestedSort);
  const university = await prisma.university.findUnique({ where: { slug } });
  if (!university) notFound();

  const [users, officialClubs] = await Promise.all([prisma.user.findMany({
    where: { universityId: university.id, ...VERIFIED_LEADERBOARD_FILTER },
    select: {
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
    },
  }), prisma.group.findMany({ where: { universityId: university.id, kind: "OFFICIAL_CLUB", suspendedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, description: true, _count: { select: { memberships: { where: { status: "ACTIVE" } } } } } })]);
  const leaderboard = rankLeaderboard(users, sort);
  const [insights, activity] = await Promise.all([
    getUniversityInsights(university.id, users),
    getCampusActivityFeed(university.id),
  ]);

  return (
    <div className="flex flex-col gap-10 px-6 py-12">
      <Link href="/universities" className="inline-flex w-fit items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground">
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
        All universities
      </Link>

      <header className="flex flex-col gap-4">
        <SectionLabel>University standings</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{university.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-muted-foreground">
          <span>{university.city}, {university.state}</span>
          {university.ownershipType ? <><span aria-hidden="true">·</span><span>{OWNERSHIP_LABEL[university.ownershipType]}</span></> : null}
          {university.website ? <><span aria-hidden="true">·</span><a href={university.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground underline decoration-gold decoration-2 underline-offset-4"><HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-3.5" />{university.website.replace(/^https?:\/\//, "")}</a></> : null}
        </div>
      </header>

      {officialClubs.length ? (
        <section>
          <SectionLabel>Official clubs</SectionLabel>
          <div className="mt-4 divide-y divide-border border border-border">
            {officialClubs.map((club) => (
              <Link key={club.id} href={`/clubs/${club.slug}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted">
                <div><p className="text-sm font-medium">{club.name}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{club.description}</p></div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{club._count.memberships} members</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {leaderboard.length ? <UniversityInsights data={insights} /> : null}

      {leaderboard.length ? <UniversityActivity events={activity} /> : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1 rounded-md border border-border bg-muted/20 p-1" aria-label="Leaderboard sort">
          {LEADERBOARD_SORTS.map((option) => (
            <Link
              key={option.value}
              href={`/universities/${slug}?sort=${option.value}`}
              aria-current={sort === option.value ? "page" : undefined}
              className={cn(
                "rounded-sm px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.08em] transition-colors",
                sort === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>

        {!leaderboard.length ? (
          <Empty className="rounded-md border border-border"><EmptyHeader><EmptyTitle>No ranked students yet</EmptyTitle><EmptyDescription>Verified students from {university.name} will appear here.</EmptyDescription></EmptyHeader></Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <div className="min-w-[1040px]">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
                <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase">Leaderboard · {LEADERBOARD_SORTS.find((item) => item.value === sort)?.label}</span>
                <LiveTag>{leaderboard.length} verified</LiveTag>
              </div>
              <div className="grid grid-cols-[3rem_15rem_repeat(5,5rem)_7rem_8rem] items-center border-b border-border bg-card font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase">
                {[
                  ["#", "text-right"], ["Student", ""], ["Total", "text-right"], ["Easy", "text-right"],
                  ["Medium", "text-right"], ["Hard", "text-right"], ["Contest", "text-right"],
                  ["Global", "text-right"], ["Last synced", "text-right"],
                ].map(([label, align], index) => <span key={label} className={cn("px-3 py-2", align, index < 2 && "sticky left-0 z-10 bg-card", index === 1 && "left-12")}>{label}</span>)}
              </div>
              {leaderboard.map((student) => {
                const profileHref = student.publicProfileEnabled && student.publicProfileHandle ? `/u/${student.publicProfileHandle}` : null;
                return (
                  <div key={student.id} className={cn("group relative grid grid-cols-[3rem_15rem_repeat(5,5rem)_7rem_8rem] items-center border-b border-border last:border-b-0 hover:bg-muted", student.rank === 1 && "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gold")}>
                    <span className={cn("sticky left-0 z-10 bg-card px-3 py-3 text-right font-mono text-sm tabular-nums group-hover:bg-muted", student.rank === 1 ? "text-gold" : student.rank != null && student.rank <= 3 ? "text-foreground" : "text-muted-foreground")}>{student.rank == null ? "—" : String(student.rank).padStart(2, "0")}</span>
                    <div className="sticky left-12 z-10 min-w-0 bg-card px-3 py-3 group-hover:bg-muted">
                      {profileHref ? <Link href={profileHref} className="block truncate text-sm font-medium hover:underline">{student.name}</Link> : <p className="truncate text-sm font-medium">{student.name}</p>}
                      <p className="truncate font-mono text-xs text-muted-foreground">@{student.leetcodeUsername}</p>
                    </div>
                    {[student.leetcodeTotalSolved, student.leetcodeEasySolved, student.leetcodeMediumSolved, student.leetcodeHardSolved].map((value, index) => <span key={index} className="px-3 py-3 text-right font-mono text-sm tabular-nums">{number(value)}</span>)}
                    <span className="px-3 py-3 text-right font-mono text-sm tabular-nums">{student.leetcodeContestRating == null ? "—" : Math.round(student.leetcodeContestRating).toLocaleString()}</span>
                    <span className="px-3 py-3 text-right font-mono text-sm text-muted-foreground tabular-nums">{number(student.leetcodeRanking, "#")}</span>
                    <span className="px-3 py-3 text-right font-mono text-[0.68rem] text-muted-foreground tabular-nums">{student.leetcodeLastSyncedAt?.toLocaleDateString() ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
