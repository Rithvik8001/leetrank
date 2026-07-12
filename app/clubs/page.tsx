import Link from "next/link";
import { getPublicClubs } from "@/lib/clubs/queries";
import { SectionLabel } from "@/components/marketing/section-label";
import { Button } from "@/components/ui/button";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const data = await getPublicClubs({
    query: p.q,
    university: p.university,
    state: p.state,
    sort: p.sort,
    page: Number(p.page) || 1,
  });
  return (
    <main className="mx-auto min-h-screen max-w-6xl border-x border-border">
      <header className="border-b border-border px-6 py-16">
        <SectionLabel>Official university clubs</SectionLabel>
        <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Find your coding community
        </h1>
        <form className="mt-8 flex max-w-2xl gap-2">
          <input
            name="q"
            defaultValue={p.q}
            placeholder="Search clubs or universities"
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
          />
          <Button type="submit">Search</Button>
        </form>
      </header>
      <section className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {data.clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.slug}`}
            className="bg-background p-6 transition-colors hover:bg-muted"
          >
            <p className="font-mono text-[0.65rem] text-gold uppercase">
              Official club
            </p>
            <h2 className="mt-3 font-heading text-xl font-extrabold">
              {club.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {club.university?.name}
            </p>
            <p className="mt-5 line-clamp-3 text-sm text-muted-foreground">
              {club.description}
            </p>
            <p className="mt-6 font-mono text-xs tabular-nums">
              {club._count.memberships} members · {club._count.challenges}{" "}
              active challenges
            </p>
          </Link>
        ))}
      </section>
      {!data.clubs.length ? (
        <p className="px-6 py-20 text-center text-sm text-muted-foreground">
          No official clubs match this search.
        </p>
      ) : null}
    </main>
  );
}
