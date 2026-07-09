import { FadeIn } from "@/components/marketing/motion/reveal";
import { RankTicker } from "@/components/marketing/rank-ticker";
import { socialProof } from "@/lib/marketing/content";

export function SocialProof() {
  return (
    <section id="universities" className="border-b border-border">
      <div className="border-b border-border">
        <RankTicker />
      </div>
      <FadeIn className="px-6 py-12">
        <p className="mb-7 text-center font-mono text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
          {socialProof.label}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {socialProof.universities.map((name) => (
            <span
              key={name}
              className="font-heading text-lg font-semibold tracking-tight text-foreground/55"
            >
              {name}
            </span>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
