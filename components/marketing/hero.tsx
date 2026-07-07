import Link from "next/link";

import { MotionButton } from "@/components/marketing/motion/motion-button";
import { HeroLeaderboardPreview } from "@/components/marketing/hero-leaderboard-preview";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { hero } from "@/lib/marketing/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="bg-dotted pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] opacity-60"
      />
      <div className="relative flex flex-col gap-12 px-6 pt-16 pb-20 lg:flex-row lg:items-center lg:gap-8 lg:pt-28 lg:pb-32">
        <StaggerGroup className="flex flex-col items-start gap-7 lg:w-1/2">
          <StaggerItem>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-1 pr-3 pl-1.5 font-mono text-xs font-medium text-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rank-up opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-rank-up" />
              </span>
              {hero.eyebrow}
            </div>
          </StaggerItem>
          <StaggerItem>
            <h1 className="font-heading text-5xl leading-[1.02] font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-6xl lg:text-[4.25rem]">
              {hero.headline}
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-xl text-lg text-muted-foreground">
              {hero.subhead}
            </p>
          </StaggerItem>
          <StaggerItem className="flex flex-col gap-3 sm:flex-row">
            <MotionButton
              size="lg"
              nativeButton={false}
              render={<Link href={hero.primaryCta.href} />}
            >
              {hero.primaryCta.label}
            </MotionButton>
            <MotionButton
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href={hero.secondaryCta.href} />}
            >
              {hero.secondaryCta.label}
            </MotionButton>
          </StaggerItem>
        </StaggerGroup>

        <FadeIn
          delay={0.2}
          className="flex justify-center lg:w-1/2 lg:justify-end"
        >
          <HeroLeaderboardPreview />
        </FadeIn>
      </div>
    </section>
  );
}
