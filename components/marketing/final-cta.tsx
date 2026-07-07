import Link from "next/link";

import { Button } from "@/components/ui/button";
import { finalCta } from "@/lib/marketing/content";

export function FinalCta() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {finalCta.heading}
        </h2>
        <p className="max-w-lg text-primary-foreground/80">{finalCta.body}</p>
        <Button
          size="lg"
          variant="secondary"
          nativeButton={false}
          render={<Link href={finalCta.cta.href} />}
        >
          {finalCta.cta.label}
        </Button>
      </div>
    </section>
  );
}
