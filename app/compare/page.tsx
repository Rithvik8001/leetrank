import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUniversityRank } from "@/lib/users/profiles";
import { SectionLabel } from "@/components/marketing/section-label";
import { PeerPicker } from "@/components/compare/peer-picker";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

function display(value: number | null, prefix = "") {
  return value == null ? "—" : `${prefix}${value.toLocaleString()}`;
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const current = await prisma.user.findUnique({ where: { id: session.user.id }, include: { university: true } });
  if (!current?.universityId || !current.university) redirect("/onboarding");

  const peers = await prisma.user.findMany({
    where: { universityId: current.universityId, leetcodeVerified: true, id: { not: current.id }, leetcodeUsername: { not: null } },
    orderBy: [{ name: "asc" }, { leetcodeUsername: "asc" }],
    select: { id: true, name: true, leetcodeUsername: true },
  });
  const { user: selectedId } = await searchParams;
  const peer = selectedId
    ? await prisma.user.findFirst({
        where: { id: { equals: selectedId, not: current.id }, universityId: current.universityId, leetcodeVerified: true },
      })
    : null;

  const [yourRank, peerRank] = await Promise.all([
    getUniversityRank(current.universityId, current.leetcodeTotalSolved),
    peer ? getUniversityRank(peer.universityId, peer.leetcodeTotalSolved) : null,
  ]);
  const metrics = peer ? [
    ["Total solved", display(current.leetcodeTotalSolved), display(peer.leetcodeTotalSolved)],
    ["Easy", display(current.leetcodeEasySolved), display(peer.leetcodeEasySolved)],
    ["Medium", display(current.leetcodeMediumSolved), display(peer.leetcodeMediumSolved)],
    ["Hard", display(current.leetcodeHardSolved), display(peer.leetcodeHardSolved)],
    ["Global rank", display(current.leetcodeRanking, "#"), display(peer.leetcodeRanking, "#")],
    ["Contest rating", current.leetcodeContestRating == null ? "—" : Math.round(current.leetcodeContestRating).toLocaleString(), peer.leetcodeContestRating == null ? "—" : Math.round(peer.leetcodeContestRating).toLocaleString()],
    ["Contest global", display(current.leetcodeContestGlobalRanking, "#"), display(peer.leetcodeContestGlobalRanking, "#")],
    ["Campus rank", display(yourRank, "#"), display(peerRank, "#")],
    ["Last synced", current.leetcodeLastSyncedAt?.toLocaleDateString() ?? "—", peer.leetcodeLastSyncedAt?.toLocaleDateString() ?? "—"],
  ] : [];

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <SectionLabel>Peer comparison</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl">Compare with a classmate.</h1>
        <p className="max-w-xl text-muted-foreground">A side-by-side snapshot of verified students at {current.university.name}.</p>
      </header>

      {peers.length ? <PeerPicker peers={peers.map((p) => ({ id: p.id, name: p.name, username: p.leetcodeUsername! }))} selectedId={peer?.id ?? null} /> : null}

      {!peers.length ? (
        <Empty className="rounded-md border border-border"><EmptyHeader><EmptyMedia variant="icon"><HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} /></EmptyMedia><EmptyTitle>No classmates to compare yet</EmptyTitle><EmptyDescription>When another student verifies at {current.university.name}, they’ll appear here.</EmptyDescription></EmptyHeader></Empty>
      ) : !peer ? (
        <Empty className="rounded-md border border-border"><EmptyHeader><EmptyTitle>Choose a verified classmate</EmptyTitle><EmptyDescription>Use the search above to open a side-by-side stats ledger.</EmptyDescription></EmptyHeader></Empty>
      ) : (
        <section className="overflow-hidden rounded-md border border-border bg-card" aria-label={`Comparison with ${peer.name}`}>
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-muted/30 px-4 py-3 font-mono text-xs sm:px-5">
            <span className="text-muted-foreground">Metric</span><span className="border-l-2 border-gold pl-4 font-medium">You</span><span className="text-right font-medium">{peer.name}</span>
          </div>
          {metrics.map(([label, yours, theirs]) => (
            <div key={label} className="grid grid-cols-[1fr_1fr_1fr] items-center border-b border-border px-4 py-3.5 last:border-b-0 sm:px-5">
              <span className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase">{label}</span>
              <span className="pl-4 font-mono text-sm tabular-nums">{yours}</span>
              <span className="text-right font-mono text-sm tabular-nums">{theirs}</span>
            </div>
          ))}
        </section>
      )}

      <Link href={`/universities/${current.university.slug}`} className="group inline-flex w-fit items-center gap-2 text-sm font-medium">View the full university leaderboard <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 transition-transform group-hover:translate-x-0.5" /></Link>
    </div>
  );
}
