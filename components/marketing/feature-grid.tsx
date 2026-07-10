import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  RankingIcon,
  Analytics01Icon,
  GitCompareIcon,
  ShieldEnergyIcon,
  Share01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";

import { SectionLabel } from "@/components/marketing/section-label";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/marketing/motion/reveal";
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
    <section id="features" className="border-b border-border px-6 py-24">
      <FadeIn className="mb-12 max-w-2xl">
        <SectionLabel className="mb-5">{featureGrid.eyebrow}</SectionLabel>
        <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
          {featureGrid.heading}
        </h2>
      </FadeIn>

      <StaggerGroup className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {featureGrid.features.map((feature, i) => {
          return (
            <StaggerItem
              key={feature.title}
              className="group flex flex-col gap-3.5 bg-background p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <HugeiconsIcon
                  icon={icons[i]}
                  className="size-5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                {"status" in feature && feature.status === "coming-soon" ? (
                  <span className="font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
                    Coming soon
                  </span>
                ) : null}
              </div>
              <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-foreground"
              >
                {feature.cta}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
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
