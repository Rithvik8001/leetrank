import { SectionLabel } from "@/components/marketing/section-label";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { howItWorks } from "@/lib/marketing/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-muted/30">
      <div className="px-6 py-20">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <SectionLabel align="center" className="mb-4">
            {howItWorks.eyebrow}
          </SectionLabel>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {howItWorks.heading}
          </h2>
        </FadeIn>

        <StaggerGroup className="grid gap-10 md:grid-cols-4 md:gap-6 md:divide-x md:divide-border">
          {howItWorks.steps.map((step) => (
            <StaggerItem
              key={step.number}
              className="flex flex-col gap-3 md:px-6 md:first:pl-0"
            >
              <span className="font-mono text-5xl leading-none font-bold tracking-tight text-primary tabular-nums">
                {step.number}
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
