import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { MotionButton } from "@/components/marketing/motion/motion-button";
import { HeroLeaderboardPreview } from "@/components/marketing/hero-leaderboard-preview";
import { LiveTag } from "@/components/standings";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/marketing/motion/reveal";
import { hero } from "@/lib/marketing/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="relative grid gap-14 px-6 pt-20 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pt-28 lg:pb-32">
        <StaggerGroup className="flex flex-col items-start gap-7">
          <StaggerItem>
            <LiveTag>{hero.eyebrow}</LiveTag>
          </StaggerItem>
          <StaggerItem>
            <h1 className="font-heading text-[2.75rem] leading-[0.98] font-extrabold tracking-[-0.03em] text-balance text-foreground sm:text-6xl lg:text-[4.5rem]">
              {hero.headline}
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {hero.subhead}
            </p>
          </StaggerItem>
          <StaggerItem className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <MotionButton
              size="lg"
              nativeButton={false}
              render={<Link href={hero.primaryCta.href} />}
            >
              {hero.primaryCta.label}
            </MotionButton>
            <Link
              href={hero.secondaryCta.href}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {hero.secondaryCta.label}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </StaggerItem>
        </StaggerGroup>

        <FadeIn delay={0.15} className="flex justify-center lg:justify-end">
          <HeroLeaderboardPreview />
        </FadeIn>
      </div>
    </section>
  );
}
