import Link from "next/link";

import type { InsightEntry, UniversityInsights } from "@/lib/universities/insights";
import { SectionLabel } from "@/components/marketing/section-label";
import {
  Ledger,
  LedgerRow,
  LiveTag,
  RankNumber,
  StatCell,
  StatTile,
} from "@/components/standings";

function stat(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

function InsightList({
  title,
  entries,
  format,
}: {
  title: string;
  entries: InsightEntry[];
  format: (value: number) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-foreground uppercase">
        {title}
      </span>
      {entries.length ? (
        <Ledger>
          {entries.map((entry, index) => (
            <LedgerRow key={entry.id} leader={index === 0}>
              <RankNumber rank={index + 1} />
              <div className="min-w-0">
                {entry.profileHref ? (
                  <Link href={entry.profileHref} className="block truncate text-sm font-medium hover:underline">
                    {entry.name}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-medium">{entry.name}</p>
                )}
                <p className="truncate font-mono text-xs text-muted-foreground">
                  @{entry.username}
                </p>
              </div>
              <StatCell value={format(entry.value)} />
            </LedgerRow>
          ))}
        </Ledger>
      ) : (
        <div className="rounded-md border border-border bg-card px-4 py-6 font-mono text-xs text-muted-foreground">
          Building weekly history — check back after a few daily syncs.
        </div>
      )}
    </div>
  );
}

export function UniversityInsights({ data }: { data: UniversityInsights }) {
  const tiles: { label: string; value: string }[] = [
    { label: "Total verified", value: stat(data.totalVerified) },
    { label: "Active this week", value: stat(data.activeThisWeek) },
    { label: "Avg solved", value: stat(data.averageSolved) },
    { label: "Avg contest rating", value: stat(data.averageRating) },
  ];

  return (
    <section className="flex flex-col gap-5" aria-labelledby="university-insights-heading">
      <div className="flex items-center justify-between gap-4">
        <SectionLabel>
          <span id="university-insights-heading">Weekly insights</span>
        </SectionLabel>
        <LiveTag>{data.totalVerified} verified</LiveTag>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <StatTile key={tile.label} label={tile.label} value={tile.value} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InsightList
          title="Most improved"
          entries={data.mostImproved}
          format={(value) => `+${value} ${value === 1 ? "place" : "places"}`}
        />
        <InsightList
          title="Most active"
          entries={data.mostActive}
          format={(value) => `+${value.toLocaleString()}`}
        />
        <InsightList
          title="Top hard solvers"
          entries={data.topHardSolvers}
          format={(value) => value.toLocaleString()}
        />
      </div>
    </section>
  );
}
