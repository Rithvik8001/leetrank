import { getAdminClubApplications } from "@/lib/clubs/queries";
import { ClubReviewControls } from "@/components/clubs/club-forms";
import { SectionLabel } from "@/components/marketing/section-label";
export default async function AdminClubsPage() {
  const applications = await getAdminClubApplications();
  return (
    <main>
      <header className="border-b border-border px-6 py-12">
        <SectionLabel>Platform administration</SectionLabel>
        <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-[-0.03em]">
          Club review queue
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Review recognition evidence and manage official status.
        </p>
      </header>
      <div className="divide-y divide-border">
        {applications.map((a) => (
          <article
            key={a.id}
            className="grid gap-6 px-6 py-8 lg:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-2xl font-extrabold">
                  {a.proposedName}
                </h2>
                <span className="font-mono text-xs text-gold">{a.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {a.university.name} · {a.group._count.memberships} members ·
                submitted by {a.submittedBy.name}
              </p>
              <p className="mt-5 max-w-3xl text-sm">{a.description}</p>
              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-xs text-muted-foreground">
                    Requested URL
                  </dt>
                  <dd>/clubs/{a.requestedSlug}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs text-muted-foreground">
                    Official website
                  </dt>
                  <dd>
                    <a
                      href={a.officialWebsiteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.officialWebsiteUrl}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs text-muted-foreground">
                    Faculty advisor
                  </dt>
                  <dd>
                    {a.facultyAdvisorName} · {a.facultyAdvisorEmail}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs text-muted-foreground">
                    Public contact
                  </dt>
                  <dd>{a.contactEmail}</dd>
                </div>
              </dl>
              <div className="mt-5 border-l-2 border-gold pl-4 text-sm text-muted-foreground">
                {a.evidenceNote}
              </div>
              {a.reviewNote ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Review note: {a.reviewNote}
                </p>
              ) : null}
            </div>
            <ClubReviewControls
              applicationId={a.id}
              groupId={a.group.id}
              isApproved={a.status === "APPROVED"}
              isSuspended={Boolean(a.group.suspendedAt)}
            />
          </article>
        ))}
        {!applications.length ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">
            No club applications yet.
          </p>
        ) : null}
      </div>
    </main>
  );
}
