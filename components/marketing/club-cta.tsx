import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clubCta } from "@/lib/marketing/content";

export function ClubCta() {
  return (
    <section id="club-cta" className="mx-auto max-w-6xl px-6 py-4">
      <div className="flex flex-col items-start gap-6 rounded-2xl border border-primary/20 bg-secondary/40 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="flex max-w-xl flex-col gap-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={UserGroupIcon} className="size-5 text-primary" strokeWidth={2} />
            <Badge variant="secondary" className="font-mono">
              {clubCta.eyebrow}
            </Badge>
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {clubCta.heading}
          </h2>
          <p className="text-muted-foreground">{clubCta.body}</p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={clubCta.cta.href} />}
          className="shrink-0"
        >
          {clubCta.cta.label}
        </Button>
      </div>
    </section>
  );
}
