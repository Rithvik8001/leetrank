import Link from "next/link";
import { headers } from "next/headers";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import {
  comparisonUrl,
  difficultyDistribution,
  difficultyInsights,
  DIFFICULTIES,
} from "@/lib/comparison";
import {
  getComparableProfile,
  getComparableProfileForUser,
  normalizePublicHandle,
  toProfileSuggestion,
} from "@/lib/users/profiles";
import { SectionLabel } from "@/components/marketing/section-label";
import { ShareActions } from "@/components/share-actions";
import { ProfileComparisonForm } from "@/components/compare/profile-comparison-form";

function display(value: number | null, prefix = "") {
  return value == null ? "—" : `${prefix}${value.toLocaleString()}`;
}

function Distribution({ values }: { values: ReturnType<typeof difficultyDistribution> }) {
  if (!values) return <span className="font-mono text-xs text-muted-foreground">Unavailable</span>;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-label="Difficulty distribution">
        <span className="bg-muted-foreground/30" style={{ width: `${values.Easy}%` }} />
        <span className="bg-foreground/55" style={{ width: `${values.Medium}%` }} />
        <span className="bg-gold" style={{ width: `${values.Hard}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[0.6rem] text-muted-foreground tabular-nums">
        {DIFFICULTIES.map((difficulty) => <span key={difficulty}>{difficulty[0]} {values[difficulty].toFixed(0)}%</span>)}
      </div>
    </div>
  );
}

function Insight({ insight }: { insight: { stronger: string | null; weaker: string | null } | null }) {
  if (!insight || (!insight.stronger && !insight.weaker)) return <span>No clear edge</span>;
  return <span>{insight.stronger ? `Stronger ${insight.stronger}` : "No stronger area"} · {insight.weaker ? `Weaker ${insight.weaker}` : "No weaker area"}</span>;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { left: rawLeft = "", right: rawRight = "" } = await searchParams;
  const explicitLeft = Boolean(rawLeft.trim());
  const explicitRight = Boolean(rawRight.trim());
  const requestedLeftHandle = normalizePublicHandle(rawLeft);
  const rightHandle = normalizePublicHandle(rawRight);
  const publicOnly = !session;

  const [left, right] = await Promise.all([
    explicitLeft
      ? getComparableProfile(requestedLeftHandle, publicOnly)
      : session
        ? getComparableProfileForUser(session.user.id)
        : null,
    explicitRight ? getComparableProfile(rightHandle, publicOnly) : null,
  ]);
  const leftHandle = left?.publicProfileHandle ?? requestedLeftHandle;
  const ready = Boolean(left && right);
  const invalidHandles = [
    explicitLeft && !left ? rawLeft : null,
    explicitRight && !right ? rawRight : null,
  ].filter((handle): handle is string => Boolean(handle));
  const comparisonError = invalidHandles.length
    ? `We couldn't find ${invalidHandles.length === 1 ? `@${invalidHandles[0]}` : "one or both profiles"}. Search for a verified LeetRank username and select it from the results.`
    : null;

  const leftDistribution = left ? difficultyDistribution({ total: left.leetcodeTotalSolved, easy: left.leetcodeEasySolved, medium: left.leetcodeMediumSolved, hard: left.leetcodeHardSolved }) : null;
  const rightDistribution = right ? difficultyDistribution({ total: right.leetcodeTotalSolved, easy: right.leetcodeEasySolved, medium: right.leetcodeMediumSolved, hard: right.leetcodeHardSolved }) : null;
  const insights = difficultyInsights(leftDistribution, rightDistribution);
  const metrics = left && right ? [
    ["Total solved", display(left.leetcodeTotalSolved), display(right.leetcodeTotalSolved)],
    ["Easy", display(left.leetcodeEasySolved), display(right.leetcodeEasySolved)],
    ["Medium", display(left.leetcodeMediumSolved), display(right.leetcodeMediumSolved)],
    ["Hard", display(left.leetcodeHardSolved), display(right.leetcodeHardSolved)],
    ["Contest rating", left.leetcodeContestRating == null ? "—" : Math.round(left.leetcodeContestRating).toLocaleString(), right.leetcodeContestRating == null ? "—" : Math.round(right.leetcodeContestRating).toLocaleString()],
    ["Global rank", display(left.leetcodeRanking, "#"), display(right.leetcodeRanking, "#")],
    ["Campus rank", display(left.universityRank, "#"), display(right.universityRank, "#")],
    ["Last synced", left.leetcodeLastSyncedAt?.toLocaleDateString() ?? "—", right.leetcodeLastSyncedAt?.toLocaleDateString() ?? "—"],
  ] : [];
  const sharePath = ready ? comparisonUrl(leftHandle, rightHandle) : "/compare";

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <SectionLabel>Profile comparison</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Put two profiles side by side.</h1>
        <p className="max-w-xl text-muted-foreground">Compare the latest verified LeetCode snapshots. Public links work when both profiles are shared publicly.</p>
      </header>

      <ProfileComparisonForm
        initialLeft={left ? toProfileSuggestion(left) : null}
        initialRight={right ? toProfileSuggestion(right) : null}
        errorMessage={comparisonError}
      />

      {left && right ? (
        <>
          <section className="overflow-hidden rounded-md border border-border bg-card" aria-label={`${left.name} compared with ${right.name}`}>
            <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)] border-b border-border bg-muted/30 px-4 py-3 font-mono text-xs sm:px-5">
              <span className="text-muted-foreground">Metric</span>
              <div className="border-l-2 border-gold pl-4"><p className="font-medium">{left.name}</p><p className="mt-1 text-[0.68rem] text-muted-foreground">@{left.leetcodeUsername} · {left.university?.name ?? "No university"}</p></div>
              <div className="text-right"><p className="font-medium">{right.name}</p><p className="mt-1 text-[0.68rem] text-muted-foreground">@{right.leetcodeUsername} · {right.university?.name ?? "No university"}</p></div>
            </div>
            {metrics.map(([label, yours, theirs]) => <div key={label} className="grid grid-cols-[minmax(7rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)] items-center border-b border-border px-4 py-3.5 sm:px-5"><span className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase">{label}</span><span className="pl-4 font-mono text-sm tabular-nums">{yours}</span><span className="text-right font-mono text-sm tabular-nums">{theirs}</span></div>)}
            <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)] items-start border-b border-border px-4 py-4 sm:px-5"><span className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase">Distribution</span><div className="pl-4"><Distribution values={leftDistribution} /></div><div className="pl-4"><Distribution values={rightDistribution} /></div></div>
            <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)] items-center px-4 py-3.5 text-sm sm:px-5"><span className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase">Readout</span><span className="pl-4 text-muted-foreground"><Insight insight={insights.left} /></span><span className="text-right text-muted-foreground"><Insight insight={insights.right} /></span></div>
          </section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 font-mono text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5 text-gold" />Verified snapshots</span></div>
            {left.publicProfileEnabled && right.publicProfileEnabled ? <ShareActions path={sharePath} title={`${left.name} vs ${right.name} on LeetRank`} /> : <p className="text-xs text-muted-foreground">Both profiles must be public to share this comparison.</p>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {left.publicProfileEnabled && left.publicProfileHandle ? <Link href={`/u/${left.publicProfileHandle}`} className="underline underline-offset-4">View {left.name}</Link> : null}
            {right.publicProfileEnabled && right.publicProfileHandle ? <Link href={`/u/${right.publicProfileHandle}`} className="underline underline-offset-4">View {right.name}</Link> : null}
          </div>
        </>
      ) : (
        <div className="flex min-h-48 items-center justify-center rounded-md border border-border px-6 text-center text-sm text-muted-foreground">Search for and select two verified LeetRank profiles to create a comparison.</div>
      )}
    </div>
  );
}
