import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { RatingDelta } from "@/lib/marketing/placeholder-data";

/**
 * The standings sheet — the product's signature surface.
 * A precise, monospaced ledger: rank numbers run down the left edge like an
 * editor's line-number gutter, hairline rules separate rows, and the leader
 * carries the one brass accent. Shared by the marketing hero and the real
 * university leaderboard so the motif is identical everywhere.
 */

export function Ledger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-md border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LedgerRow({
  leader = false,
  className,
  children,
}: {
  leader?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-3 transition-colors sm:px-5",
        "before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-transparent",
        leader && "before:bg-gold before:w-[3px]",
        !leader && "hover:bg-muted/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Two-digit, right-aligned gutter index. #1 is brass; #2/#3 hold full ink; the rest recede. */
export function RankNumber({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "w-7 text-right font-mono text-sm font-medium tabular-nums",
        rank === 1
          ? "text-gold"
          : rank <= 3
            ? "text-foreground"
            : "text-muted-foreground",
        className,
      )}
    >
      {String(rank).padStart(2, "0")}
    </span>
  );
}

/** A right-aligned tabular stat with a small mono caption underneath. */
export function StatCell({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-right", className)}>
      <div className="font-mono text-sm text-foreground tabular-nums">
        {value}
      </div>
      {label ? (
        <div className="mt-0.5 font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
          {label}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A large scorecard tile — mono uppercase caption above a loud tabular number.
 * The scorecard counterpart to the ledger's compact `StatCell`; shared by the
 * dashboard and public-profile stat grids so both surfaces stay identical.
 */
export function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-28 flex-col justify-between bg-card p-5",
        className,
      )}
    >
      <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

/** Rating movement, rendered with a triangle glyph. Muted greens/reds so brass stays the loudest color. */
export function Delta({
  delta,
  className,
}: {
  delta: RatingDelta;
  className?: string;
}) {
  if (delta.direction === "flat") {
    return (
      <span
        className={cn(
          "font-mono text-xs tabular-nums text-muted-foreground/60",
          className,
        )}
      >
        —
      </span>
    );
  }

  const isUp = delta.direction === "up";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs font-medium tabular-nums",
        isUp ? "text-rank-up" : "text-rank-down",
        className,
      )}
    >
      <span aria-hidden="true" className="text-[0.6rem] leading-none">
        {isUp ? "▲" : "▼"}
      </span>
      {Math.abs(delta.value)}
    </span>
  );
}

/** The live signal — one brass pulse + a tracked mono label. Used once per surface. */
export function LiveTag({
  children = "Live",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.62rem] font-medium tracking-[0.2em] text-muted-foreground uppercase",
        className,
      )}
    >
      <span className="live-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
