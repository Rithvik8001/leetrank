import Link from "next/link";

import { MotionButton } from "@/components/marketing/motion/motion-button";
import { StaggerGroup, StaggerItem } from "@/components/marketing/motion/reveal";
import { finalCta } from "@/lib/marketing/content";

export function FinalCta() {
  return (
    <section className="border-b border-primary-foreground/15 bg-primary text-primary-foreground">
      <StaggerGroup className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
        <StaggerItem>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {finalCta.heading}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="max-w-lg text-primary-foreground/80">{finalCta.body}</p>
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
