import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { getGroupChallengesForMember } from "@/lib/challenges/queries";
import { SectionLabel } from "@/components/marketing/section-label";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { CreateChallengeForm } from "@/components/challenges/create-challenge-form";
import { ChallengeList } from "@/components/challenges/challenge-list";

export default async function GroupChallengesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const data = await getGroupChallengesForMember(id, session.user.id);
  if (!data) notFound();

  const active = data.challenges.filter((challenge) => challenge.status === "active");
  const upcoming = data.challenges.filter((challenge) => challenge.status === "upcoming");
  const ended = data.challenges.filter((challenge) => challenge.status === "ended");

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <Link
        href={`/groups/${id}`}
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
        Group standings
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <SectionLabel>Group challenges</SectionLabel>
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
              {data.group.name}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
              Private seasons for verified members of this group.
            </p>
          </div>
        </div>
        {data.group.isOwner ? <CreateChallengeForm groupId={data.group.id} /> : null}
      </header>

      {!data.challenges.length ? (
        <Empty className="rounded-md border border-border">
          <EmptyHeader>
            <EmptyTitle>No challenges yet</EmptyTitle>
            <EmptyDescription>
              Group owners can create weekly or monthly seasons for members to join.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-8">
          <ChallengeList groupId={id} title="Active" challenges={active} />
          <ChallengeList groupId={id} title="Upcoming" challenges={upcoming} />
          <ChallengeList groupId={id} title="Past" challenges={ended} />
        </div>
      )}
    </div>
  );
}
