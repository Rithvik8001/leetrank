import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  RankingIcon,
  Analytics01Icon,
  GitCompareIcon,
  ShieldEnergyIcon,
  Share01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/marketing/section-label";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { featureGrid } from "@/lib/marketing/content";

const icons: IconSvgElement[] = [
  RankingIcon,
  Analytics01Icon,
  GitCompareIcon,
  ShieldEnergyIcon,
  Share01Icon,
  Award01Icon,
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-border px-6 py-20">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <SectionLabel align="center" className="mb-4">
          {featureGrid.eyebrow}
        </SectionLabel>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {featureGrid.heading}
        </h2>
      </FadeIn>

      <StaggerGroup className="grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
        {featureGrid.features.map((feature, i) => {
          const isLastInRow = i % 2 === 1;
          const isLastRow = i >= featureGrid.features.length - 2;

          return (
            <StaggerItem
              key={feature.title}
              className={cn(
                "group flex flex-col gap-3 border-border p-8",
                !isLastInRow && "sm:border-r",
                !isLastRow && "border-b",
              )}
            >
              <HugeiconsIcon
                icon={icons[i]}
                className="size-6 text-primary"
                strokeWidth={2}
              />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary transition-[gap] group-hover:gap-2"
              >
                {feature.cta}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4"
                  strokeWidth={2}
                />
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
