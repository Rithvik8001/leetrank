import {
  Ledger,
  LedgerRow,
  RankNumber,
  Delta,
  LiveTag,
} from "@/components/standings";
import { heroLeaderboard } from "@/lib/marketing/placeholder-data";

export function HeroLeaderboardPreview() {
  return (
    <Ledger className="w-full max-w-md">
      {/* Sheet header — where the standings are drawn from + the live signal */}
      <div className="flex items-center justify-between bg-muted/40 px-4 py-3 sm:px-5">
        <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-foreground uppercase">
          Northbridge Tech
        </span>
        <LiveTag>Live · this week</LiveTag>
      </div>

      {/* Column captions */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-2 sm:px-5">
        <span className="w-7 text-right font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
          #
        </span>
        <span className="font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
          Student
        </span>
        <div className="flex items-center gap-4 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
          <span className="w-10 text-right">Solved</span>
          <span className="w-12 text-right">Δ</span>
        </div>
      </div>

      {heroLeaderboard.map((entry) => (
        <LedgerRow key={entry.handle} leader={entry.rank === 1}>
          <RankNumber rank={entry.rank} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {entry.studentName}
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              {entry.handle}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-10 text-right font-mono text-sm text-foreground tabular-nums">
              {entry.problemsSolved}
            </span>
            <Delta delta={entry.ratingDelta} className="w-12 justify-end" />
          </div>
        </LedgerRow>
      ))}
    </Ledger>
  );
}
