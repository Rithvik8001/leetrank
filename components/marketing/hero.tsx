import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroLeaderboardPreview } from "@/components/marketing/hero-leaderboard-preview";
import { hero } from "@/lib/marketing/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="bg-dotted pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div className="relative flex flex-col gap-12 px-6 pt-16 pb-20 lg:flex-row lg:items-center lg:gap-8 lg:pt-24 lg:pb-28">
        <div className="flex flex-col items-start gap-6 lg:w-1/2">
          <Badge variant="secondary" className="font-mono">
            {hero.eyebrow}
          </Badge>
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {hero.subhead}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={hero.primaryCta.href} />}
            >
              {hero.primaryCta.label}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href={hero.secondaryCta.href} />}
            >
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:w-1/2 lg:justify-end">
          <HeroLeaderboardPreview />
        </div>
      </div>
    </section>
  );
}
