import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Award01Icon } from "@hugeicons/core-free-icons";

import type { ChallengeSummary } from "@/lib/challenges/queries";
import { formatChallengeDate } from "@/lib/challenges/dates";
import { SectionLabel } from "@/components/marketing/section-label";
import { LiveTag, StatCell } from "@/components/standings";
import { Button } from "@/components/ui/button";

export function GroupChallengeSummary({
  groupId,
  challenges,
}: {
  groupId: string;
  challenges: ChallengeSummary[];
}) {
  if (!challenges.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <SectionLabel>Challenges</SectionLabel>
          <p className="text-sm text-muted-foreground">
            Active and upcoming seasons for this group.
          </p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/groups/${groupId}/challenges`} />}>
          View all
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
        </Button>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/groups/${groupId}/challenges/${challenge.id}`}
            className="grid gap-4 px-5 py-4 transition-colors hover:bg-muted sm:grid-cols-[1fr_auto_auto]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <HugeiconsIcon icon={Award01Icon} strokeWidth={1.8} className="size-4 text-gold" />
                <p className="truncate text-sm font-medium">{challenge.title}</p>
                {challenge.status === "active" ? <LiveTag>Live</LiveTag> : null}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {formatChallengeDate(challenge.startsOn)} — {formatChallengeDate(challenge.endsOn)}
              </p>
            </div>
            <StatCell value={challenge.participantCount.toLocaleString()} label="joined" />
            <StatCell value={challenge.metricLabel} label={challenge.status} className="sm:min-w-32" />
          </Link>
        ))}
      </div>
    </section>
  );
}
