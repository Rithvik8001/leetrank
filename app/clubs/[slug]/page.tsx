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
  return (
    <main className="mx-auto min-h-screen max-w-6xl border-x border-border">
      <header className="border-b border-border px-6 py-14">
        <SectionLabel>{club.university?.name}</SectionLabel>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs text-gold uppercase">
              Official club
            </p>
            <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              {club.name}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
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
        <div className="mt-7 flex flex-wrap gap-4 font-mono text-xs">
          {club.websiteUrl ? (
            <a href={club.websiteUrl} rel="noreferrer" target="_blank">
              Website
            </a>
          ) : null}
          {club.githubUrl ? (
            <a href={club.githubUrl} rel="noreferrer" target="_blank">
              GitHub
            </a>
          ) : null}
          {club.discordUrl ? (
            <a href={club.discordUrl} rel="noreferrer" target="_blank">
              Discord
            </a>
          ) : null}
          {club.contactEmail ? (
            <a href={`mailto:${club.contactEmail}`}>Contact</a>
          ) : null}
        </div>
      </header>
      <section className="border-b border-border px-6 py-10">
        <h2 className="font-heading text-2xl font-extrabold">Join the club</h2>
        <div className="mt-4">
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
      </section>
      <section className="grid gap-px bg-border md:grid-cols-2">
        <div className="bg-background p-6">
          <SectionLabel>Officers</SectionLabel>
          <div className="mt-5 divide-y divide-border">
            {club.memberships
              .filter((m) => m.role !== "MEMBER" && m.publicOfficerVisible)
              .map((m) => (
                <div
                  key={m.user.id}
                  className="flex justify-between py-3 text-sm"
                >
                  <span>{m.user.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.role}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-background p-6">
          <SectionLabel>Announcements</SectionLabel>
          <div className="mt-5 divide-y divide-border">
            {club.announcements.map((a) => (
              <article key={a.id} className="py-4">
                <h3 className="font-medium">{a.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.body}
                </p>
                <p className="mt-3 font-mono text-[0.65rem] text-muted-foreground">
                  {a.author.name} · {a.publishedAt.toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
