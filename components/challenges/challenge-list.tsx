import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import type { ChallengeSummary } from "@/lib/challenges/queries";
import { formatChallengeDate } from "@/lib/challenges/dates";
import { LiveTag, StatCell } from "@/components/standings";

export function ChallengeList({
  groupId,
  title,
  challenges,
}: {
  groupId: string;
  title: string;
  challenges: ChallengeSummary[];
}) {
  if (!challenges.length) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/groups/${groupId}/challenges/${challenge.id}`}
            className="group grid gap-4 px-5 py-4 transition-colors hover:bg-muted sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium">{challenge.title}</p>
                {challenge.status === "active" ? <LiveTag>Live</LiveTag> : null}
              </div>
              {challenge.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{challenge.description}</p>
              ) : null}
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {formatChallengeDate(challenge.startsOn)} — {formatChallengeDate(challenge.endsOn)}
              </p>
            </div>
            <StatCell value={challenge.metricLabel} label="metric" className="sm:min-w-32" />
            <StatCell value={challenge.participantCount.toLocaleString()} label="joined" />
            <div className="flex items-center justify-end text-muted-foreground">
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
