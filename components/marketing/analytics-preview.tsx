import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeatmap } from "@/components/marketing/analytics-heatmap";
import { analyticsPreview } from "@/lib/marketing/content";
import { submissionHeatmap, ratingHistory } from "@/lib/marketing/placeholder-data";

function RatingSparkline({ points }: { points: { rating: number }[] }) {
  const values = points.map((p) => p.rating);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = values.map((value, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 32 - ((value - min) / range) * 32;
    return `${x},${y}`;
  });

  const lastUp = values[values.length - 1] >= values[values.length - 2];

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden="true"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={100}
        cy={32 - ((values[values.length - 1] - min) / range) * 32}
        r={1.75}
        fill={lastUp ? "var(--color-rank-up)" : "var(--color-rank-down)"}
      />
    </svg>
  );
}

export function AnalyticsPreview() {
  return (
    <section id="analytics" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4 font-mono">
          {analyticsPreview.eyebrow}
        </Badge>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {analyticsPreview.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">{analyticsPreview.body}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{analyticsPreview.heatmapLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsHeatmap days={submissionHeatmap} />
          </CardContent>
        </Card>

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
      </div>
    </section>
  );
}
