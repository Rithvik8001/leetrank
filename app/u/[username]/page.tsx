import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, CheckmarkCircle02Icon, Exchange01Icon, GraduationScrollIcon } from "@hugeicons/core-free-icons";

import { comparisonUrl } from "@/lib/comparison";
import { getPublicProfile, normalizePublicHandle } from "@/lib/users/profiles";
import { getUserSnapshots } from "@/lib/users/snapshots";
import { daysAgo } from "@/lib/users/progress";
import { Wordmark } from "@/components/wordmark";
import { SectionLabel } from "@/components/marketing/section-label";
import { StatTile } from "@/components/standings";
import { HistoryCharts } from "@/components/charts/history-charts";
import { Button } from "@/components/ui/button";
import { ShareActions } from "@/components/share-actions";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Profile not found" };
  const handle = normalizePublicHandle(profile.leetcodeUsername ?? username);
  const title = `${profile.name} (@${profile.leetcodeUsername})`;
  const description = `${profile.name}'s verified LeetRank scorecard${profile.university ? ` at ${profile.university.name}` : ""}.`;
  return { title, description, alternates: { canonical: `/u/${handle}` }, openGraph: { title, description } };
}

function value(number: number | null, prefix = "") {
  return number == null ? "—" : `${prefix}${number.toLocaleString()}`;
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile?.leetcodeUsername) notFound();
  const handle = normalizePublicHandle(profile.leetcodeUsername);
  const snapshots = await getUserSnapshots(profile.id, { since: daysAgo(new Date(), 90) });
  const historyRows = snapshots.map((snapshot) => ({
    capturedAt: snapshot.capturedAt.toISOString(),
    totalSolved: snapshot.totalSolved,
    hardSolved: snapshot.hardSolved,
    contestRating: snapshot.contestRating,
  }));
  const stats = [
    ["Problems solved", value(profile.leetcodeTotalSolved)], ["Easy", value(profile.leetcodeEasySolved)],
    ["Medium", value(profile.leetcodeMediumSolved)], ["Hard", value(profile.leetcodeHardSolved)],
    ["Global rank", value(profile.leetcodeRanking, "#")],
    ["Contest rating", profile.leetcodeContestRating == null ? "—" : Math.round(profile.leetcodeContestRating).toLocaleString()],
    ["Contest global", value(profile.leetcodeContestGlobalRanking, "#")], ["Campus rank", value(profile.universityRank, "#")],
  ];

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
      <header className="flex h-16 items-center border-b border-border px-6"><Link href="/" aria-label="LeetRank home"><Wordmark /></Link></header>
      <main className="flex flex-col gap-8 px-6 py-12 sm:py-16">
        <section className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Verified student profile</SectionLabel>
            <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">{profile.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-foreground"><HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5 text-gold" />@{profile.leetcodeUsername}</span>
              {profile.university ? <Link href={`/universities/${profile.university.slug}`} className="inline-flex items-center gap-1.5 hover:text-foreground"><HugeiconsIcon icon={GraduationScrollIcon} strokeWidth={2} className="size-3.5" />{profile.university.name}</Link> : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="font-mono text-[0.68rem] text-muted-foreground tabular-nums">{profile.leetcodeLastSyncedAt ? `Last synced ${profile.leetcodeLastSyncedAt.toLocaleString()}` : "Not synced yet"}</p>
            <div className="flex flex-wrap gap-2">
              <Button nativeButton={false} render={<Link href={comparisonUrl(handle)} />}><HugeiconsIcon icon={Exchange01Icon} strokeWidth={2} />Compare</Button>
              <ShareActions path={`/u/${handle}`} title={`${profile.name} on LeetRank`} />
            </div>
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4" aria-label="Latest LeetCode statistics">
          {stats.map(([label, stat]) => <StatTile key={label} label={label} value={stat} />)}
        </section>

        {historyRows.length >= 2 ? (
          <section aria-label="Progress history">
            <HistoryCharts rows={historyRows} rangeLabel="last 90 days" />
          </section>
        ) : null}

        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3"><span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase">Earned badges</span><span className="font-mono text-xs text-muted-foreground">{profile.badges.length}</span></div>
          {profile.badges.length ? profile.badges.map((badge) => <div key={badge.id} className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0"><div className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">{badge.iconUrl ? <Image src={badge.iconUrl} alt="" width={28} height={28} /> : <HugeiconsIcon icon={Award01Icon} strokeWidth={1.7} className="size-4 text-muted-foreground" />}</div><div><p className="text-sm font-medium">{badge.name}</p><p className="font-mono text-[0.68rem] text-muted-foreground">{badge.earnedAt ? `Earned ${badge.earnedAt}` : "LeetCode badge"}</p></div></div>) : <p className="px-5 py-6 text-sm text-muted-foreground">No badges reported by LeetCode.</p>}
        </section>
      </main>
    </div>
  );
}
