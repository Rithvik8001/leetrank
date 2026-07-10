import type { RatingDelta } from "@/lib/marketing/placeholder-data";
import type { PersonalProgress, ProgressMetric } from "@/lib/users/progress";
import { SectionLabel } from "@/components/marketing/section-label";
import { Delta, StatTile } from "@/components/standings";
import { HistoryCharts } from "@/components/charts/history-charts";

function signed(value: number | null): string {
  if (value == null) return "—";
  return value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString();
}

function ratingValue(delta: RatingDelta | null): string {
  if (delta == null) return "—";
  if (delta.direction === "flat") return "0";
  return `${delta.direction === "up" ? "+" : "−"}${delta.value.toLocaleString()}`;
}

function sinceHint(metric: ProgressMetric): string | null {
  if (!metric.partial || !metric.since) return null;
  return `since ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(metric.since)}`;
}

export function PersonalProgress({ data }: { data: PersonalProgress }) {
  const tiles: { label: string; value: string; hint?: React.ReactNode }[] = [
    { label: "Solved this week", value: signed(data.weekSolved.value), hint: sinceHint(data.weekSolved) },
    { label: "Solved this month", value: signed(data.monthSolved.value), hint: sinceHint(data.monthSolved) },
    { label: "Hard this month", value: signed(data.monthHard.value), hint: sinceHint(data.monthHard) },
    {
      label: "Rating change",
      value: ratingValue(data.ratingChange),
      hint: data.ratingChange ? <Delta delta={data.ratingChange} /> : null,
    },
    {
      label: "Rank movement",
      value: signed(data.rank.movement),
      hint: data.rank.now != null ? `now #${data.rank.now.toLocaleString()}` : null,
    },
  ];

  return (
    <section className="flex flex-col gap-5" aria-labelledby="personal-progress-heading">
      <div className="flex flex-col gap-3">
        <SectionLabel>
          <span id="personal-progress-heading">Personal progress</span>
        </SectionLabel>
        {data.insight ? (
          <p className="max-w-2xl text-pretty text-base text-foreground">{data.insight}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {tiles.map((tile) => (
            <StatTile key={tile.label} label={tile.label} value={tile.value} hint={tile.hint} />
          ))}
        </div>
      </div>

      <HistoryCharts rows={data.chart} rangeLabel="last 90 days" />
    </section>
  );
}
