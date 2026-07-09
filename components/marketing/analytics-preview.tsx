import { SectionLabel } from "@/components/marketing/section-label";
import { AnalyticsHeatmap } from "@/components/marketing/analytics-heatmap";
import { RatingSparkline } from "@/components/marketing/rating-sparkline";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/marketing/motion/reveal";
import { analyticsPreview } from "@/lib/marketing/content";
import { submissionHeatmap, ratingHistory } from "@/lib/marketing/placeholder-data";

export function AnalyticsPreview() {
  const latest = ratingHistory[ratingHistory.length - 1].rating;
  const gain = latest - ratingHistory[0].rating;

  return (
    <section id="analytics" className="border-b border-border px-6 py-24">
      <FadeIn className="mb-12 max-w-2xl">
        <SectionLabel className="mb-5">{analyticsPreview.eyebrow}</SectionLabel>
        <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
          {analyticsPreview.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">{analyticsPreview.body}</p>
      </FadeIn>

      <StaggerGroup className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
        <StaggerItem className="flex flex-col gap-5 bg-card p-7">
          <p className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">
            {analyticsPreview.heatmapLabel}
          </p>
          <AnalyticsHeatmap days={submissionHeatmap} />
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-5 bg-card p-7">
          <p className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">
            {analyticsPreview.ratingLabel}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {latest}
            </span>
            <span className="font-mono text-sm font-medium text-rank-up tabular-nums">
              ▲ {gain}
            </span>
            <span className="text-xs text-muted-foreground">this season</span>
          </div>
          <RatingSparkline points={ratingHistory} />
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
