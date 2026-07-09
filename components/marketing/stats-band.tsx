import { CountUp } from "@/components/marketing/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { statsBand } from "@/lib/marketing/content";

export function StatsBand() {
  return (
    <section className="border-b border-border px-6 py-20">
      <StaggerGroup className="grid gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        {statsBand.stats.map((stat) => (
          <StaggerItem key={stat.label} className="sm:px-8 sm:first:pl-0">
            <p className="font-mono text-5xl font-semibold tracking-tight text-foreground tabular-nums sm:text-6xl">
              <CountUp value={stat.value} />
              <span className="text-gold">{stat.suffix}</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
      <p className="mt-10 font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
        {statsBand.disclaimer}
      </p>
    </section>
  );
}
