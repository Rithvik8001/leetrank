import { statsBand } from "@/lib/marketing/content";

export function StatsBand() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {statsBand.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-4xl font-semibold text-foreground sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {statsBand.disclaimer}
        </p>
      </div>
    </section>
  );
}
