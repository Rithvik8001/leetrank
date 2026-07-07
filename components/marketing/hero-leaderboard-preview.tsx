import { HugeiconsIcon } from "@hugeicons/react";
import { TradeUpIcon, TradeDownIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <Card className="w-full max-w-md shadow-xl shadow-primary/5 ring-foreground/5">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Northbridge Tech — This week</CardTitle>
        <Badge variant="secondary" className="font-mono">
          Live
        </Badge>
      </CardHeader>
      <CardContent>
        <StaggerGroup className="flex flex-col gap-1">
          {heroLeaderboard.map((entry) => (
            <StaggerItem
              key={entry.handle}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50",
                entry.rank === 1 &&
                  "bg-rank-gold/10 ring-1 ring-rank-gold/30 hover:bg-rank-gold/15",
              )}
            >
              <span
                className={cn(
                  "w-5 shrink-0 font-mono text-sm font-semibold",
                  entry.rank === 1 ? "text-rank-gold" : "text-muted-foreground",
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
              <span className="shrink-0 font-mono text-sm text-foreground">
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
