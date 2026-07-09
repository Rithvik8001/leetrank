import type { ReactNode } from "react";

import { SectionLabel } from "@/components/marketing/section-label";

export function AuthCard({
  eyebrow,
  heading,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="rounded-md border border-border bg-card p-7">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="mt-4 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground">
          {heading}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="text-center text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}
