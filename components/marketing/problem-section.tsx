import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { problemSection } from "@/lib/marketing/content";

export function ProblemSection() {
  return (
    <section className="border-b border-border px-6 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4 font-mono">
          {problemSection.eyebrow}
        </Badge>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {problemSection.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">{problemSection.body}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              {problemSection.before.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
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
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-primary">
              {problemSection.after.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
