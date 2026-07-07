import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <Logo width={28} height={29} className="text-primary" />
      <span className="font-heading text-lg font-semibold tracking-tight">
        LeetRank
      </span>
    </span>
  );
}
