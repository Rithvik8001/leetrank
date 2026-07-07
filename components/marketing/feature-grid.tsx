import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  RankingIcon,
  Analytics01Icon,
  GitCompareIcon,
  ShieldEnergyIcon,
  Share01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
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
  wide: "lg:col-span-2",
  tall: "lg:col-span-1 lg:row-span-2",
  sm: "lg:col-span-1",
};

function makeIcon(icon: IconSvgElement) {
  return function FeatureIcon({ className }: { className?: string }) {
    return <HugeiconsIcon icon={icon} className={className} strokeWidth={2} />;
  };
}

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-border px-6 py-20">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4 font-mono">
          {featureGrid.eyebrow}
        </Badge>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {featureGrid.heading}
        </h2>
      </FadeIn>

      <StaggerGroup>
        <BentoGrid className="auto-rows-[16rem]">
          {featureGrid.features.map((feature, i) => (
            <StaggerItem
              key={feature.title}
              className={cn("col-span-3", sizeClasses[feature.size])}
            >
              <BentoCard
                name={feature.title}
                description={feature.description}
                href={feature.href}
                cta={feature.cta}
                Icon={makeIcon(icons[i])}
                className="h-full"
                background={
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-transform duration-300 group-hover:scale-110" />
                }
              />
            </StaggerItem>
          ))}
        </BentoGrid>
      </StaggerGroup>
    </section>
  );
}
