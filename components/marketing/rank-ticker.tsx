import { cn } from "@/lib/utils";
import {
  rankMovements,
  type RankMovement,
} from "@/lib/marketing/placeholder-data";

function TickerEntry({ movement }: { movement: RankMovement }) {
  const { ratingDelta } = movement;
  const isFlat = ratingDelta.direction === "flat";
  const isUp = ratingDelta.direction === "up";

  return (
    <div className="flex shrink-0 items-center gap-2.5 px-5 font-mono text-xs whitespace-nowrap">
      <span className="text-muted-foreground/70 tabular-nums">
        {String(movement.rank).padStart(2, "0")}
      </span>
      <span className="font-medium text-foreground">{movement.handle}</span>
      <span className="hidden text-muted-foreground/50 sm:inline">
        {movement.university}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 tabular-nums",
          isFlat
            ? "text-muted-foreground/60"
            : isUp
              ? "text-rank-up"
              : "text-rank-down",
        )}
      >
        {isFlat ? (
          "—"
        ) : (
          <>
            <span aria-hidden="true" className="text-[0.6rem] leading-none">
              {isUp ? "▲" : "▼"}
            </span>
            {Math.abs(ratingDelta.value)}
          </>
        )}
      </span>
    </div>
  );
}

export function RankTicker() {
  const track = [...rankMovements, ...rankMovements];

  return (
    <div
      className="group relative flex items-stretch bg-card"
      aria-hidden="true"
    >
      <div className="z-10 flex shrink-0 items-center gap-2 border-r border-border bg-card px-4 py-3 font-mono text-[0.62rem] font-medium tracking-[0.2em] text-foreground uppercase">
        <span className="live-dot" />
        Live
      </div>
      <div className="mask-[linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)] flex flex-1 overflow-hidden">
        <div className="flex animate-marquee items-center py-3">
          {track.map((movement, i) => (
            <TickerEntry key={`${movement.handle}-${i}`} movement={movement} />
          ))}
        </div>
      </div>
    </div>
  );
}
