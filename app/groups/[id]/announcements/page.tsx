import { notFound } from "next/navigation";
import { getClubGate } from "@/lib/clubs/auth";
import { canPublishAnnouncement } from "@/lib/clubs/permissions";
import { getClubAnnouncements } from "@/lib/clubs/queries";
import {
  AnnouncementArchiveButton,
  AnnouncementForm,
} from "@/components/clubs/club-forms";
import { SectionLabel } from "@/components/marketing/section-label";
export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gate = await getClubGate(id);
  if (!gate || gate.group.kind !== "OFFICIAL_CLUB") notFound();
  const items = await getClubAnnouncements(id);
  return (
    <main className="flex flex-col gap-8 px-6 py-12">
      <header>
        <SectionLabel>Club communications</SectionLabel>
        <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-[-0.03em]">
          Announcements
        </h1>
      </header>
      {canPublishAnnouncement(gate.role) && !gate.group.suspendedAt ? (
        <AnnouncementForm groupId={id} />
      ) : null}
      <div className="divide-y divide-border border border-border">
        {items.map((a) => (
          <article key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-xl font-extrabold">
                    {a.title}
                  </h2>
                  <span className="font-mono text-[0.65rem] text-gold">
                    {a.visibility}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.body}
                </p>
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  {a.author.name} · {a.publishedAt.toLocaleDateString()}
                </p>
              </div>
              {canPublishAnnouncement(gate.role) ? (
                <AnnouncementArchiveButton groupId={id} id={a.id} />
              ) : null}
            </div>
          </article>
        ))}
        {!items.length ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No announcements yet.
          </p>
        ) : null}
      </div>
    </main>
  );
}
