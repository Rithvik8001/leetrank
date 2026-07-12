import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPublicClub } from "@/lib/clubs/queries";
import { rankLeaderboard } from "@/lib/leaderboard";
import { SectionLabel } from "@/components/marketing/section-label";
import {
  Ledger,
  LedgerRow,
  RankNumber,
  StatCell,
} from "@/components/standings";
import { ClubJoinForm } from "@/components/clubs/club-forms";
import { Button } from "@/components/ui/button";

function roleLabel(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await getPublicClub(slug);
  if (!club) notFound();
  const session = await auth.api.getSession({ headers: await headers() });
  const viewer = session
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          universityId: true,
          leetcodeVerified: true,
          groupMemberships: {
            where: { groupId: club.id, status: "ACTIVE" },
            select: { id: true },
          },
          clubMembershipApplications: {
            where: { groupId: club.id, status: "PENDING" },
            select: { id: true },
          },
        },
      })
    : null;
  const ranked = rankLeaderboard(
    club.memberships.filter((m) => m.user.leetcodeVerified).map((m) => m.user),
    "contest-rating",
  );
  const officers = club.memberships.filter(
    (m) => m.role !== "MEMBER" && m.publicOfficerVisible,
  );
  const externalLinks = [
    club.websiteUrl ? { label: "Website", href: club.websiteUrl } : null,
    club.githubUrl ? { label: "GitHub", href: club.githubUrl } : null,
    club.discordUrl ? { label: "Discord", href: club.discordUrl } : null,
    club.contactEmail
      ? { label: "Contact", href: `mailto:${club.contactEmail}` }
      : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  return (
    <>
      <header className="border-b border-border px-6 py-14">
        <SectionLabel>{club.university?.name}</SectionLabel>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[0.6rem] tracking-[0.12em] text-gold uppercase">
              Official club
            </p>
            <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
              {club.name}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
              {club.description}
            </p>
          </div>
          {viewer?.groupMemberships.length ? (
            <Button
              nativeButton={false}
              render={<Link href={`/groups/${club.id}`} />}
            >
              Open club space
            </Button>
          ) : null}
        </div>
        {externalLinks.length ? (
          <div className="mt-7 flex flex-wrap gap-5 font-mono text-xs">
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                rel="noreferrer"
                target="_blank"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </header>
      <section className="border-b border-border px-6 py-12">
        <SectionLabel>Join the club</SectionLabel>
        <div className="mt-6">
          {!session ? (
            <Button
              nativeButton={false}
              render={<Link href={`/login?callbackURL=/clubs/${slug}`} />}
            >
              Log in to apply
            </Button>
          ) : !viewer?.leetcodeVerified ? (
            <p className="text-sm text-muted-foreground">
              Verify your LeetCode account before applying.
            </p>
          ) : viewer.universityId !== club.universityId ? (
            <p className="text-sm text-muted-foreground">
              Membership is limited to students at {club.university?.name}.
            </p>
          ) : viewer.groupMemberships.length ? (
            <p className="text-sm text-muted-foreground">
              You are an active member.
            </p>
          ) : (
            <ClubJoinForm
              groupId={club.id}
              pendingApplication={Boolean(
                viewer.clubMembershipApplications.length,
              )}
            />
          )}
        </div>
      </section>
      <section className="border-b border-border px-6 py-12">
        <SectionLabel>Standings</SectionLabel>
        {ranked.length ? (
          <Ledger className="mt-6">
            {ranked.slice(0, 20).map((entry) => (
              <LedgerRow key={entry.id} leader={entry.rank === 1}>
                <RankNumber rank={entry.rank ?? 0} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{entry.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {entry.leetcodeUsername}
                  </p>
                </div>
                <StatCell
                  label="Rating"
                  value={
                    entry.leetcodeContestRating
                      ? Math.round(entry.leetcodeContestRating).toLocaleString()
                      : "—"
                  }
                />
                <StatCell
                  label="Solved"
                  value={entry.leetcodeTotalSolved?.toLocaleString() ?? "—"}
                />
              </LedgerRow>
            ))}
          </Ledger>
        ) : (
          <div className="mt-6 rounded-md border border-border bg-card px-4 py-6 font-mono text-xs text-muted-foreground">
            No verified members on the board yet.
          </div>
        )}
      </section>
      <section className="grid gap-px bg-border md:grid-cols-2">
        <div className="bg-card p-6">
          <SectionLabel>Officers</SectionLabel>
          <div className="mt-5 divide-y divide-border">
            {officers.length ? (
              officers.map((m) => (
                <div
                  key={m.user.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="truncate font-medium">{m.user.name}</span>
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase">
                    {roleLabel(m.role)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-3 font-mono text-xs text-muted-foreground">
                No officers listed.
              </p>
            )}
          </div>
        </div>
        <div className="bg-card p-6">
          <SectionLabel>Announcements</SectionLabel>
          <div className="mt-5 divide-y divide-border">
            {club.announcements.length ? (
              club.announcements.map((a) => (
                <article key={a.id} className="py-4 first:pt-0">
                  <h3 className="font-medium">{a.title}</h3>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                    {a.body}
                  </p>
                  <p className="mt-3 font-mono text-[0.65rem] text-muted-foreground tabular-nums">
                    {a.author.name} · {a.publishedAt.toLocaleDateString()}
                  </p>
                </article>
              ))
            ) : (
              <p className="py-3 font-mono text-xs text-muted-foreground">
                No announcements yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
