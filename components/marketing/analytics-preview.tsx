import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/marketing/section-label";
import { AnalyticsHeatmap } from "@/components/marketing/analytics-heatmap";
import { RatingSparkline } from "@/components/marketing/rating-sparkline";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { analyticsPreview } from "@/lib/marketing/content";
import { submissionHeatmap, ratingHistory } from "@/lib/marketing/placeholder-data";

export function AnalyticsPreview() {
  return (
    <section id="analytics" className="border-b border-border px-6 py-20">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <SectionLabel align="center" className="mb-4">
          {analyticsPreview.eyebrow}
        </SectionLabel>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {analyticsPreview.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">{analyticsPreview.body}</p>
      </FadeIn>

      <StaggerGroup className="grid gap-6 md:grid-cols-2">
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>{analyticsPreview.heatmapLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsHeatmap days={submissionHeatmap} />
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>{analyticsPreview.ratingLabel}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <RatingSparkline points={ratingHistory} />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold tracking-tight text-foreground tabular-nums">
                  {ratingHistory[ratingHistory.length - 1].rating}
                </span>
                <span className="font-mono text-sm font-medium text-rank-up tabular-nums">
                  +{ratingHistory[ratingHistory.length - 1].rating - ratingHistory[0].rating}
                </span>
                <span className="text-xs text-muted-foreground">this season</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
