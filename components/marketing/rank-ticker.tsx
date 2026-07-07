import { HugeiconsIcon } from "@hugeicons/react";
import { TradeUpIcon, TradeDownIcon } from "@hugeicons/core-free-icons";

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
    <div className="flex shrink-0 items-center gap-2 px-5 font-mono text-xs whitespace-nowrap sm:text-sm">
      <span className="text-muted-foreground">#{movement.rank}</span>
      <span className="font-medium text-foreground">{movement.handle}</span>
      <span className="hidden text-muted-foreground/60 sm:inline">
        {movement.university}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium tabular-nums",
          isFlat
            ? "text-muted-foreground"
            : isUp
              ? "text-rank-up"
              : "text-rank-down",
        )}
      >
        {!isFlat && (
          <HugeiconsIcon
            icon={isUp ? TradeUpIcon : TradeDownIcon}
            className="size-3.5"
            strokeWidth={2.5}
          />
        )}
        {isFlat ? "±0" : `${isUp ? "+" : "-"}${Math.abs(ratingDelta.value)}`}
      </span>
    </div>
  );
}

export function RankTicker() {
  const track = [...rankMovements, ...rankMovements];

  return (
    <div
      className="group relative flex items-stretch bg-muted/40"
      aria-hidden="true"
    >
      <div className="z-10 flex shrink-0 items-center gap-1.5 border-r border-border bg-muted/40 px-4 py-2.5 font-mono text-[0.65rem] font-semibold tracking-[0.15em] text-foreground">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rank-up opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-rank-up" />
        </span>
        LIVE
      </div>
      <div className="mask-[linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)] flex flex-1 overflow-hidden">
        <div className="flex animate-marquee items-center py-2.5">
          {track.map((movement, i) => (
            <TickerEntry key={`${movement.handle}-${i}`} movement={movement} />
          ))}
        </div>
      </div>
    </div>
  );
}
