import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Eyebrow label — a quiet mono caption with a single brass tick.
 * Deliberately understated: the loud element on any surface is the data, not the label.
 */
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
        "inline-flex items-center gap-2.5 font-mono text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground uppercase",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-[1px] bg-gold"
      />
      {children}
    </div>
  );
}
