import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import {
  LEADERBOARD_SORTS,
  parseLeaderboardSort,
  rankLeaderboard,
} from "@/lib/leaderboard";
import { getGroupForMember, getGroupMembers } from "@/lib/groups/queries";
import { getGroupChallengeHighlights } from "@/lib/challenges/queries";
import { cn } from "@/lib/utils";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { SectionLabel } from "@/components/marketing/section-label";
import { LiveTag } from "@/components/standings";
import { InviteLink } from "@/components/groups/invite-link";
import { GroupMembers } from "@/components/groups/group-members";
import { GroupOwnerControls } from "@/components/groups/group-owner-controls";
import { GroupChallengeSummary } from "@/components/challenges/group-challenge-summary";

function number(value: number | null, prefix = "") {
  return value == null ? "—" : `${prefix}${value.toLocaleString()}`;
}

export default async function GroupLeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const { sort: requestedSort } = await searchParams;
  const sort = parseLeaderboardSort(requestedSort);

  const group = await getGroupForMember(id, session.user.id);
  if (!group) notFound();

  const [members, challenges] = await Promise.all([
    getGroupMembers(id),
    getGroupChallengeHighlights(id),
  ]);
  const leaderboard = rankLeaderboard(members, sort);

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const inviteUrl = `${protocol}://${host}/groups/join/${group.inviteToken}`;

  return (
    <div className="flex flex-col gap-10 px-6 py-12">
      <Link href="/groups" className="inline-flex w-fit items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground">
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
        All groups
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <SectionLabel>Group standings</SectionLabel>
            <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{group.name}</h1>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {group.members.length} {group.members.length === 1 ? "member" : "members"}
            </p>
          </div>
          {group.isOwner ? <GroupOwnerControls groupId={group.id} currentName={group.name} /> : null}
        </div>
        <InviteLink inviteUrl={inviteUrl} groupId={group.id} isOwner={group.isOwner} />
      </header>

      <GroupChallengeSummary groupId={group.id} challenges={challenges} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1 rounded-md border border-border bg-muted/20 p-1" aria-label="Leaderboard sort">
          {LEADERBOARD_SORTS.map((option) => (
            <Link
              key={option.value}
              href={`/groups/${group.id}?sort=${option.value}`}
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
          <Empty className="rounded-md border border-border"><EmptyHeader><EmptyTitle>No ranked members yet</EmptyTitle><EmptyDescription>Verified members will appear here. Share the invite link to add friends.</EmptyDescription></EmptyHeader></Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <div className="min-w-[1040px]">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
                <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase">Leaderboard · {LEADERBOARD_SORTS.find((item) => item.value === sort)?.label}</span>
                <LiveTag>{leaderboard.length} verified</LiveTag>
              </div>
              <div className="grid grid-cols-[3rem_15rem_repeat(5,5rem)_7rem_8rem] items-center border-b border-border bg-card font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase">
                {[
                  ["#", "text-right"], ["Member", ""], ["Total", "text-right"], ["Easy", "text-right"],
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

      <section className="flex flex-col gap-4">
        <SectionLabel>Members</SectionLabel>
        <GroupMembers
          groupId={group.id}
          members={group.members}
          viewerId={session.user.id}
          viewerIsOwner={group.isOwner}
        />
      </section>
    </div>
  );
}
