import { CountUp } from "@/components/marketing/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { statsBand } from "@/lib/marketing/content";

export function StatsBand() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="px-6 py-16">
        <StaggerGroup className="grid gap-8 sm:grid-cols-3 sm:divide-x sm:divide-border">
          {statsBand.stats.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <p className="font-mono text-5xl font-bold tracking-tight text-foreground tabular-nums sm:text-6xl">
                <CountUp value={stat.value} />
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {statsBand.disclaimer}
        </p>
      </div>
    </section>
  );
}
