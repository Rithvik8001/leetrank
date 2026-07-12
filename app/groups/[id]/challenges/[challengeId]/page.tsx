import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { formatChallengeDate, utcDateInput } from "@/lib/challenges/dates";
import { getChallengeForMember } from "@/lib/challenges/queries";
import type { ChallengeFormValues } from "@/lib/challenges/schemas";
import { SectionLabel } from "@/components/marketing/section-label";
import { LiveTag, StatTile } from "@/components/standings";
import { ChallengeJoinButton } from "@/components/challenges/challenge-join-button";
import { ChallengeOwnerControls } from "@/components/challenges/challenge-owner-controls";
import { ChallengeStandings } from "@/components/challenges/challenge-standings";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string; challengeId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id, challengeId } = await params;
  const data = await getChallengeForMember(id, challengeId, session.user.id);
  if (!data) notFound();

  const initialValues: ChallengeFormValues = {
    title: data.challenge.title,
    description: data.challenge.description ?? "",
    metric: data.challenge.metric,
    startsOn: utcDateInput(data.challenge.startsOn),
    endsOn: utcDateInput(data.challenge.endsOn),
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <Link
        href={`/groups/${id}/challenges`}
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
        Group challenges
      </Link>

      <header className="flex flex-col gap-5 border-b border-border pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <SectionLabel>Challenge</SectionLabel>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
                  {data.challenge.title}
                </h1>
                {data.challenge.status === "active" ? <LiveTag>Live</LiveTag> : null}
              </div>
              {data.challenge.description ? (
                <p className="mt-3 max-w-2xl text-pretty text-sm text-muted-foreground">
                  {data.challenge.description}
                </p>
              ) : null}
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                {data.group.name} · {formatChallengeDate(data.challenge.startsOn)} —{" "}
                {formatChallengeDate(data.challenge.endsOn)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.group.isOwner && data.challenge.status === "upcoming" ? (
              <ChallengeOwnerControls
                groupId={id}
                challengeId={challengeId}
                initialValues={initialValues}
              />
            ) : null}
            <ChallengeJoinButton
              groupId={id}
              challengeId={challengeId}
              joined={data.viewerParticipant != null}
              status={data.challenge.status}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        <StatTile label="Metric" value={data.challenge.metricLabel} />
        <StatTile label="Participants" value={data.challenge.participantCount.toLocaleString()} />
        <StatTile label="Status" value={data.challenge.status} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionLabel>Standings</SectionLabel>
        <ChallengeStandings
          standings={data.standings}
          metric={data.challenge.metric}
          status={data.challenge.status}
        />
      </section>
    </div>
  );
}
