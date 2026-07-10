import Link from "next/link";

import type { ActivityEvent, ActivityType } from "@/lib/activity/feed";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/marketing/section-label";
import { Ledger, LedgerRow, LiveTag } from "@/components/standings";

const GLYPH: Record<ActivityType, { symbol: string; brass: boolean }> = {
  solved: { symbol: "✓", brass: false },
  "milestone-solved": { symbol: "★", brass: true },
  rating: { symbol: "▲", brass: false },
  "milestone-rating": { symbol: "★", brass: true },
  joined: { symbol: "+", brass: false },
};

// The verb phrase that follows the actor's name. Kept here so the sentence reads
// naturally while the name stays a separate (linkable) node.
function phrase(event: ActivityEvent): string {
  switch (event.type) {
    case "solved":
      return `solved ${event.value.toLocaleString()} problems`;
    case "milestone-solved":
      return `crossed ${event.value.toLocaleString()} problems solved`;
    case "rating":
      return `gained ${event.value.toLocaleString()} rating`;
    case "milestone-rating":
      return `reached ${event.value.toLocaleString()} rating`;
    case "joined":
      return "joined the leaderboard";
  }
}

function isMilestone(type: ActivityType): boolean {
  return type === "milestone-solved" || type === "milestone-rating";
}

export function UniversityActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="university-activity-heading">
      <div className="flex items-center justify-between gap-4">
        <SectionLabel>
          <span id="university-activity-heading">Recent activity</span>
        </SectionLabel>
        {events.length ? <LiveTag>{events.length}</LiveTag> : null}
      </div>

      {events.length ? (
        <Ledger>
          {events.map((event) => {
            const glyph = GLYPH[event.type];
            return (
              <LedgerRow key={event.id}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-4 text-center font-mono text-sm leading-none",
                    glyph.brass ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {glyph.symbol}
                </span>
                <p className="min-w-0 truncate text-sm text-muted-foreground">
                  {event.actor.profileHref ? (
                    <Link href={event.actor.profileHref} className="font-medium text-foreground hover:underline">
                      {event.actor.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{event.actor.name}</span>
                  )}{" "}
                  <span className={cn(isMilestone(event.type) && "text-foreground")}>{phrase(event)}</span>
                </p>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {formatRelativeTime(event.at)}
                </span>
              </LedgerRow>
            );
          })}
        </Ledger>
      ) : (
        <div className="rounded-md border border-border bg-card px-4 py-6 font-mono text-xs text-muted-foreground">
          No recent activity — check back after a few daily syncs.
        </div>
      )}
    </section>
  );
}
