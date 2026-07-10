import Link from "next/link";
import { headers } from "next/headers";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGroupByInviteToken, isGroupMember } from "@/lib/groups/queries";
import { SectionLabel } from "@/components/marketing/section-label";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { JoinGroupButton } from "@/components/groups/join-group-button";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = await getGroupByInviteToken(token);

  if (!group) {
    return (
      <div className="px-6 py-16">
        <Empty className="rounded-md border border-border">
          <EmptyHeader>
            <EmptyTitle>This invite link isn’t valid</EmptyTitle>
            <EmptyDescription>
              The link may have been regenerated or the group deleted. Ask for a fresh link.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { leetcodeVerified: true },
      })
    : null;
  const alreadyMember = session ? await isGroupMember(group.id, session.user.id) : false;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-16 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-md bg-muted text-foreground">
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-6" />
      </span>
      <div className="flex flex-col items-center gap-3">
        <SectionLabel align="center">Group invite</SectionLabel>
        <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-balance">
          Join {group.name}
        </h1>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
        </p>
      </div>

      {!session ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Sign in to join this leaderboard.</p>
          <Button nativeButton={false} render={<Link href="/login" />}>Sign in to join</Button>
        </div>
      ) : alreadyMember ? (
        <Button nativeButton={false} render={<Link href={`/groups/${group.id}`} />}>
          Open group
        </Button>
      ) : !user?.leetcodeVerified ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Group leaderboards rank verified members — finish verification to join.
          </p>
          <Button nativeButton={false} render={<Link href="/onboarding" />}>Verify your account</Button>
        </div>
      ) : (
        <JoinGroupButton token={token} />
      )}
    </div>
  );
}
