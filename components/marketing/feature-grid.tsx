import { HugeiconsIcon } from "@hugeicons/react";
import {
  RankingIcon,
  Analytics01Icon,
  GitCompareIcon,
  ShieldEnergyIcon,
  Share01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featureGrid } from "@/lib/marketing/content";

const icons = [
  RankingIcon,
  Analytics01Icon,
  GitCompareIcon,
  ShieldEnergyIcon,
  Share01Icon,
  Award01Icon,
];

const sizeClasses: Record<string, string> = {
  wide: "sm:col-span-2",
  tall: "sm:row-span-2",
  sm: "",
};

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-border px-6 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4 font-mono">
          {featureGrid.eyebrow}
        </Badge>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {featureGrid.heading}
        </h2>
      </div>

      <div className="grid auto-rows-fr grid-flow-dense gap-4 sm:grid-cols-3">
        {featureGrid.features.map((feature, i) => (
          <Card
            key={feature.title}
            className={cn(
              "flex h-full flex-col justify-start",
              sizeClasses[feature.size],
            )}
          >
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={icons[i]} strokeWidth={2} />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
