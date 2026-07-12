import Link from "next/link";
import { getPublicClubs } from "@/lib/clubs/queries";
import { SectionLabel } from "@/components/marketing/section-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

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
    <>
      <header className="border-b border-border px-6 py-14">
        <SectionLabel>Official university clubs</SectionLabel>
        <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
          Find your coding community
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
          Browse verified university clubs, follow their standings, and apply to
          the one on your campus.
        </p>
        <form className="mt-8 flex max-w-2xl gap-2">
          <Input
            name="q"
            defaultValue={p.q}
            placeholder="Search clubs or universities"
            className="h-10 flex-1"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>
      </header>

      {data.clubs.length ? (
        <section className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {data.clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="flex flex-col bg-card p-6 transition-colors hover:bg-muted/50"
            >
              <p className="font-mono text-[0.6rem] tracking-[0.12em] text-gold uppercase">
                Official club
              </p>
              <h2 className="mt-3 font-heading text-xl font-extrabold tracking-[-0.02em]">
                {club.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {club.university?.name}
              </p>
              <p className="mt-5 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {club.description}
              </p>
              <p className="mt-6 font-mono text-xs text-muted-foreground tabular-nums">
                {club._count.memberships} members · {club._count.challenges}{" "}
                active challenges
              </p>
            </Link>
          ))}
        </section>
      ) : (
        <div className="px-6 py-12">
          <Empty className="rounded-md border border-border">
            <EmptyHeader>
              <EmptyTitle>No clubs found</EmptyTitle>
              <EmptyDescription>
                No official clubs match this search. Try a different university or
                clear the filters.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </>
  );
}
