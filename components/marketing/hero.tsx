import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { MotionButton } from "@/components/marketing/motion/motion-button";
import { HeroLeaderboardPreview } from "@/components/marketing/hero-leaderboard-preview";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { hero } from "@/lib/marketing/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="bg-dotted pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div className="relative flex flex-col gap-12 px-6 pt-16 pb-20 lg:flex-row lg:items-center lg:gap-8 lg:pt-24 lg:pb-28">
        <StaggerGroup className="flex flex-col items-start gap-6 lg:w-1/2">
          <StaggerItem>
            <Badge variant="secondary" className="font-mono">
              {hero.eyebrow}
            </Badge>
          </StaggerItem>
          <StaggerItem>
            <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
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
