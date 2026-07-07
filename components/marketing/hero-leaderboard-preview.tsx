import { HugeiconsIcon } from "@hugeicons/react";
import { TradeUpIcon, TradeDownIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import {
  heroLeaderboard,
  type RatingDelta,
} from "@/lib/marketing/placeholder-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const podiumStyles: Record<number, string> = {
  1: "bg-rank-gold/10 ring-1 ring-rank-gold/30 hover:bg-rank-gold/15",
  2: "bg-rank-silver/10 ring-1 ring-rank-silver/30 hover:bg-rank-silver/15",
  3: "bg-rank-bronze/10 ring-1 ring-rank-bronze/30 hover:bg-rank-bronze/15",
};

const podiumTextStyles: Record<number, string> = {
  1: "text-rank-gold",
  2: "text-rank-silver",
  3: "text-rank-bronze",
};

function RatingDeltaChip({ delta }: { delta: RatingDelta }) {
  if (delta.direction === "flat") {
    return (
      <span className="font-mono text-xs text-muted-foreground">±0</span>
    );
  }

  const isUp = delta.direction === "up";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs font-medium",
        isUp ? "text-rank-up" : "text-rank-down",
      )}
    >
      <HugeiconsIcon
        icon={isUp ? TradeUpIcon : TradeDownIcon}
        className="size-3.5"
        strokeWidth={2.5}
      />
      {isUp ? "+" : "-"}
      {Math.abs(delta.value)}
    </span>
  );
}

export function HeroLeaderboardPreview() {
  return (
    <Card className="w-full max-w-md shadow-xl shadow-primary/5">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Northbridge Tech — This week</CardTitle>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rank-up opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-rank-up" />
          </span>
          Live
        </span>
      </CardHeader>
      <CardContent>
        <StaggerGroup className="flex flex-col gap-1">
          {heroLeaderboard.map((entry) => (
            <StaggerItem
              key={entry.handle}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50",
                podiumStyles[entry.rank],
              )}
            >
              <span
                className={cn(
                  "w-6 shrink-0 font-mono text-base font-bold tabular-nums",
                  podiumTextStyles[entry.rank] ?? "text-muted-foreground",
                )}
              >
                {entry.rank}
              </span>
              <Avatar size="sm">
                <AvatarFallback>{initials(entry.studentName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {entry.studentName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.university}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm text-foreground tabular-nums">
                {entry.problemsSolved}
              </span>
              <div className="w-14 shrink-0 text-right">
                <RatingDeltaChip delta={entry.ratingDelta} />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </CardContent>
    </Card>
  );
}
