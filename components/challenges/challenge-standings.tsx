import Link from "next/link";
import { ChallengeBaselineKind } from "@prisma/client";

import type { ChallengeMetricValue } from "@/lib/challenges/constants";
import { metricShortLabel } from "@/lib/challenges/queries";
import type { ChallengeStanding } from "@/lib/challenges/scoring";
import { Ledger, LedgerRow, RankNumber, StatCell } from "@/components/standings";

function number(value: number | null, metric: ChallengeMetricValue, signed = false) {
  if (value == null) return "—";
  const rounded = metric === "CONTEST_RATING" ? Math.round(value) : value;
  const formatted = rounded.toLocaleString();
  return signed && rounded > 0 ? `+${formatted}` : formatted;
}

function baselineLabel(kind: ChallengeBaselineKind) {
  if (kind === ChallengeBaselineKind.START_SNAPSHOT) return "start";
  if (kind === ChallengeBaselineKind.JOIN_FALLBACK) return "partial";
  return "pending";
}

export function ChallengeStandings({
  standings,
  metric,
  status,
}: {
  standings: ChallengeStanding[];
  metric: ChallengeMetricValue;
  status: "upcoming" | "active" | "ended";
}) {
  if (!standings.length) {
    return (
      <div className="flex min-h-36 items-center justify-center rounded-md border border-border px-6 text-center text-sm text-muted-foreground">
        Members who join this challenge will appear here.
      </div>
    );
  }

  return (
    <Ledger>
      <div className="grid grid-cols-[3rem_1fr_repeat(3,5.5rem)] items-center border-b border-border bg-muted/40 px-4 py-2 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase sm:px-5">
        <span className="text-right">#</span>
        <span className="px-4">Member</span>
        <span className="text-right">Delta</span>
        <span className="text-right">{metricShortLabel(metric)}</span>
        <span className="text-right">Baseline</span>
      </div>
      {standings.map((row) => (
        <LedgerRow
          key={row.id}
          leader={row.rank === 1}
          className="grid-cols-[3rem_1fr_repeat(3,5.5rem)]"
        >
          {row.rank == null ? (
            <span className="w-7 text-right font-mono text-sm font-medium text-muted-foreground/40 tabular-nums">
              —
            </span>
          ) : (
            <RankNumber rank={row.rank} />
          )}
          <div className="min-w-0 px-4">
            {row.profileHref ? (
              <Link href={row.profileHref} className="block truncate text-sm font-medium hover:underline">
                {row.name}
              </Link>
            ) : (
              <p className="truncate text-sm font-medium">{row.name}</p>
            )}
            <p className="truncate font-mono text-xs text-muted-foreground">
              {row.username ? `@${row.username}` : "Verified member"}
            </p>
          </div>
          <StatCell
            value={status === "upcoming" ? "—" : number(row.delta, metric, true)}
            label={row.finalized ? "final" : status}
          />
          <StatCell value={number(row.currentValue, metric)} label={metricShortLabel(metric)} />
          <StatCell value={number(row.baselineValue, metric)} label={baselineLabel(row.baselineKind)} />
        </LedgerRow>
      ))}
    </Ledger>
  );
}
