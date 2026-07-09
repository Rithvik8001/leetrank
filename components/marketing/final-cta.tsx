import Link from "next/link";

import { MotionButton } from "@/components/marketing/motion/motion-button";
import { StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { finalCta } from "@/lib/marketing/content";

export function FinalCta() {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <StaggerGroup className="mx-auto flex max-w-3xl flex-col items-center gap-7 px-6 py-24 text-center">
        <StaggerItem>
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.68rem] font-medium tracking-[0.2em] uppercase opacity-70">
            <span className="live-dot" aria-hidden="true" />
            Claim your rank
          </span>
        </StaggerItem>
        <StaggerItem>
          <h2 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
            {finalCta.heading}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="max-w-lg text-primary-foreground/70">{finalCta.body}</p>
        </StaggerItem>
        <StaggerItem>
          <MotionButton
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href={finalCta.cta.href} />}
          >
            {finalCta.cta.label}
          </MotionButton>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
