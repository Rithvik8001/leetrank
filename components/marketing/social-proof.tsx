import { FadeIn } from "@/components/marketing/motion/reveal";
import { RankTicker } from "@/components/marketing/rank-ticker";
import { socialProof } from "@/lib/marketing/content";

export function SocialProof() {
  return (
    <section id="universities" className="border-b border-border bg-muted/30">
      <div className="border-b border-border/60">
        <RankTicker />
      </div>
      <FadeIn className="px-6 py-10">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          {socialProof.label}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {socialProof.universities.map((name) => (
            <span
              key={name}
              className="font-heading text-lg text-foreground/70"
            >
              {name}
            </span>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
