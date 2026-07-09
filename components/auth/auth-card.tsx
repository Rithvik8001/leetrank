import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <Card className="p-2">
        <CardHeader className="gap-3 px-4 pt-3">
          <SectionLabel>{eyebrow}</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {heading}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">{children}</CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
