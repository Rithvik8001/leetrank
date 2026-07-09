import { SectionLabel } from "@/components/marketing/section-label";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/marketing/motion/reveal";
import { howItWorks } from "@/lib/marketing/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border px-6 py-24">
      <FadeIn className="mb-12 max-w-2xl">
        <SectionLabel className="mb-5">{howItWorks.eyebrow}</SectionLabel>
        <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
          {howItWorks.heading}
        </h2>
      </FadeIn>

      <StaggerGroup className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-md border border-border">
        {howItWorks.steps.map((step) => (
          <StaggerItem
            key={step.number}
            className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 px-6 py-6 sm:grid-cols-[auto_10rem_1fr] sm:gap-x-8"
          >
            <span className="font-mono text-sm font-medium text-muted-foreground tabular-nums">
              {step.number}
            </span>
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="col-span-2 mt-1.5 text-sm text-muted-foreground sm:col-span-1 sm:col-start-3 sm:mt-0">
              {step.description}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
