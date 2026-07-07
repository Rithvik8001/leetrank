import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeatmap } from "@/components/marketing/analytics-heatmap";
import { RatingSparkline } from "@/components/marketing/rating-sparkline";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { analyticsPreview } from "@/lib/marketing/content";
import { submissionHeatmap, ratingHistory } from "@/lib/marketing/placeholder-data";

export function AnalyticsPreview() {
  return (
    <section id="analytics" className="border-b border-border px-6 py-20">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4 font-mono">
          {analyticsPreview.eyebrow}
        </Badge>
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
            <CardContent className="flex flex-col gap-2">
              <RatingSparkline points={ratingHistory} />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-foreground">
                  {ratingHistory[ratingHistory.length - 1].rating}
                </span>
                <span className="font-mono text-sm text-rank-up">
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
