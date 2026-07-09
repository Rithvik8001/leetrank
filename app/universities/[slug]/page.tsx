import Link from "next/link";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { prisma } from "@/lib/prisma";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SectionLabel } from "@/components/marketing/section-label";
import {
  Ledger,
  LedgerRow,
  RankNumber,
  LiveTag,
} from "@/components/standings";

const OWNERSHIP_LABEL: Record<string, string> = {
  PUBLIC: "Public",
  PRIVATE_NONPROFIT: "Private nonprofit",
  PRIVATE_FOR_PROFIT: "Private for-profit",
};

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const university = await prisma.university.findUnique({ where: { slug } });
  if (!university) {
    notFound();
  }

  const leaderboard = await prisma.user.findMany({
    where: { universityId: university.id, leetcodeVerified: true },
    orderBy: { leetcodeTotalSolved: "desc" },
    select: {
      id: true,
      name: true,
      leetcodeUsername: true,
      leetcodeTotalSolved: true,
      leetcodeRanking: true,
    },
  });

  return (
    <div className="flex flex-col gap-10 px-6 py-12">
      <Link
        href="/universities"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
        All universities
      </Link>

      <header className="flex flex-col gap-4">
        <SectionLabel>University standings</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
          {university.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs tracking-[0.06em] text-muted-foreground">
          <span>
            {university.city}, {university.state}
          </span>
          {university.ownershipType ? (
            <>
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
              <span>
                {OWNERSHIP_LABEL[university.ownershipType] ??
                  university.ownershipType}
              </span>
            </>
          ) : null}
          {university.website ? (
            <>
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
              <a
                href={university.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-foreground underline decoration-gold decoration-2 underline-offset-4"
              >
                <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-3.5" />
                {university.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          ) : null}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        {leaderboard.length === 0 ? (
          <Empty className="rounded-md border border-border">
            <EmptyHeader>
              <EmptyTitle>No ranked students yet</EmptyTitle>
              <EmptyDescription>
                Once students from {university.name} verify their LeetCode
                account, they&apos;ll show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Ledger>
            {/* Sheet header */}
            <div className="flex items-center justify-between bg-muted/40 px-4 py-3 sm:px-5">
              <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-foreground uppercase">
                Leaderboard
              </span>
              <LiveTag>
                {leaderboard.length} verified
              </LiveTag>
            </div>

            {/* Column captions */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-2 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground/70 uppercase sm:px-5">
              <span className="w-7 text-right">#</span>
              <span>Student</span>
              <div className="flex items-center gap-6">
                <span className="w-14 text-right">Solved</span>
                <span className="w-16 text-right">Global</span>
              </div>
            </div>

            {leaderboard.map((student, index) => {
              const rank = index + 1;
              return (
                <LedgerRow key={student.id} leader={rank === 1}>
                  <RankNumber rank={rank} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {student.name}
                    </div>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {student.leetcodeUsername}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="w-14 text-right font-mono text-sm text-foreground tabular-nums">
                      {student.leetcodeTotalSolved ?? 0}
                    </span>
                    <span className="w-16 text-right font-mono text-sm text-muted-foreground tabular-nums">
                      {student.leetcodeRanking != null
                        ? `#${student.leetcodeRanking}`
                        : "—"}
                    </span>
                  </div>
                </LedgerRow>
              );
            })}
          </Ledger>
        )}
      </section>
    </div>
  );
}
