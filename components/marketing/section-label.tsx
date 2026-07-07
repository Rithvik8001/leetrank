import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
  align = "start",
}: {
  children: ReactNode;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 font-mono text-[0.7rem] font-semibold tracking-[0.25em] text-primary uppercase",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
      {children}
    </div>
  );
}
