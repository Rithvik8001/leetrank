import { SectionLabel } from "@/components/marketing/section-label";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/marketing/motion/reveal";
import { problemSection } from "@/lib/marketing/content";

export function ProblemSection() {
  return (
    <section className="border-b border-border px-6 py-24">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <SectionLabel align="center" className="mb-5">
          {problemSection.eyebrow}
        </SectionLabel>
        <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
          {problemSection.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">{problemSection.body}</p>
      </FadeIn>

      <StaggerGroup className="mx-auto grid max-w-3xl overflow-hidden rounded-md border border-border md:grid-cols-2 md:divide-x md:divide-border">
        <StaggerItem className="flex flex-col gap-5 p-8">
          <p className="font-mono text-[0.68rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {problemSection.before.label}
          </p>
          <ul className="flex flex-col gap-3.5">
            {problemSection.before.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 font-mono text-xs text-muted-foreground/50"
                >
                  ×
                </span>
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/30">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-5 bg-muted/40 p-8">
          <p className="inline-flex items-center gap-2.5 font-mono text-[0.68rem] font-medium tracking-[0.2em] text-foreground uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-[1px] bg-gold" />
            {problemSection.after.label}
          </p>
          <ul className="flex flex-col gap-3.5">
            {problemSection.after.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 font-mono text-sm text-gold"
                >
                  +
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
