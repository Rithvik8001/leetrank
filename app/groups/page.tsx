import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserGroups } from "@/lib/groups/queries";
import { SectionLabel } from "@/components/marketing/section-label";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export default async function GroupsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { leetcodeVerified: true },
  });
  const groups = await getUserGroups(session.user.id);

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <SectionLabel>Friends &amp; groups</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
              Your groups
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
              Private leaderboards for the people you know. Create one and share the invite link.
            </p>
          </div>
          {user?.leetcodeVerified ? <CreateGroupForm /> : null}
        </div>
      </header>

      {!user?.leetcodeVerified ? (
        <Empty className="rounded-md border border-border">
          <EmptyHeader>
            <EmptyTitle>Verify your LeetCode account first</EmptyTitle>
            <EmptyDescription>
              Group leaderboards rank verified members. <Link href="/onboarding">Finish verification</Link> to create or join a group.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : !groups.length ? (
        <Empty className="rounded-md border border-border">
          <EmptyHeader>
            <EmptyTitle>No groups yet</EmptyTitle>
            <EmptyDescription>
              Create your first group to start a private leaderboard with friends.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted"
            >
              <div className="flex min-w-0 items-center gap-3">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {group.name}
                    {group.isOwner ? (
                      <span className="ml-2 font-mono text-[0.6rem] tracking-[0.12em] text-gold uppercase">Owner</span>
                    ) : null}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
