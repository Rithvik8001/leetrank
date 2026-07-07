import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { SectionLabel } from "@/components/marketing/section-label";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { problemSection } from "@/lib/marketing/content";

export function ProblemSection() {
  return (
    <section className="border-b border-border px-6 py-20">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <SectionLabel align="center" className="mb-4">
          {problemSection.eyebrow}
        </SectionLabel>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {problemSection.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">{problemSection.body}</p>
      </FadeIn>

      <StaggerGroup className="grid overflow-hidden rounded-2xl border border-border md:grid-cols-2 md:divide-x md:divide-border">
        <StaggerItem className="flex flex-col gap-4 p-8">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {problemSection.before.label}
          </p>
          <div className="flex flex-col gap-3">
            {problemSection.before.items.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  strokeWidth={2}
                />
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-4 bg-primary/3 p-8">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            {problemSection.after.label}
          </p>
          <div className="flex flex-col gap-3">
            {problemSection.after.items.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={2}
                />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
