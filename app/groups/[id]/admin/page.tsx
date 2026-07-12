import { notFound } from "next/navigation";
import { getClubGate } from "@/lib/clubs/auth";
import { canAdminClub, canManageMembers } from "@/lib/clubs/permissions";
import { getClubAdminData } from "@/lib/clubs/queries";
import {
  MembershipDecisionButtons,
  MemberControls,
} from "@/components/clubs/club-forms";
import { SectionLabel } from "@/components/marketing/section-label";
import { StatTile } from "@/components/standings";
export default async function ClubAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gate = await getClubGate(id);
  if (!gate || !canAdminClub(gate.role) || gate.group.kind !== "OFFICIAL_CLUB")
    notFound();
  const data = await getClubAdminData(id);
  if (!data) notFound();
  return (
    <main className="flex flex-col gap-10 px-6 py-12">
      <header>
        <SectionLabel>Club administration</SectionLabel>
        <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-[-0.03em]">
          {data.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Owner: {data.owner.name} · Your role: {gate.role}
        </p>
      </header>
      {data.suspendedAt ? (
        <div className="border-l-2 border-gold bg-muted px-4 py-3 text-sm">
          This club is suspended. Administrative mutations are limited.
        </div>
      ) : null}
      <section>
        <h2 className="font-heading text-xl font-extrabold">
          Engagement health
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-px bg-border border border-border sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Members" value={data.metrics.activeMembers} />
          <StatTile label="New 30d" value={data.metrics.newMembers} />
          <StatTile label="Pending" value={data.metrics.pendingApplications} />
          <StatTile label="Active 7d" value={data.metrics.activeThisWeek} />
          <StatTile label="Stale sync" value={data.metrics.staleSync} />
          <StatTile
            label="Participation"
            value={`${data.metrics.participationRate}%`}
          />
        </div>
      </section>
      <section>
        <h2 className="font-heading text-xl font-extrabold">Action queue</h2>
        {data.clubApplications[0]?.reviewNote ? (
          <p className="mt-4 border-l-2 border-gold pl-4 text-sm">
            Application changes requested: {data.clubApplications[0].reviewNote}
          </p>
        ) : null}
        <div className="mt-4 divide-y divide-border border border-border">
          {data.membershipApplications.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="text-sm font-medium">{a.user.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {a.user.leetcodeUsername} ·{" "}
                  {a.submittedAt.toLocaleDateString()}
                </p>
                {a.message ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {a.message}
                  </p>
                ) : null}
              </div>
              <MembershipDecisionButtons groupId={id} applicationId={a.id} />
            </div>
          ))}
          {!data.membershipApplications.length ? (
            <p className="p-5 text-sm text-muted-foreground">
              No pending membership applications.
            </p>
          ) : null}
        </div>
      </section>
      <section>
        <h2 className="font-heading text-xl font-extrabold">Roster</h2>
        <div className="mt-4 divide-y divide-border border border-border">
          {data.memberships.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="text-sm font-medium">{m.user.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {m.user.leetcodeUsername} · {m.role} · joined{" "}
                  {m.createdAt.toLocaleDateString()} ·{" "}
                  {m.user.leetcodeTotalSolved ?? 0} solved
                </p>
              </div>
              <MemberControls
                groupId={id}
                userId={m.user.id}
                role={m.role}
                canManage={canManageMembers(gate.role)}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
