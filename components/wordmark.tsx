import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-foreground",
        className,
      )}
    >
      <Logo width={22} height={23} className="text-foreground" />
      <span className="font-heading text-[1.05rem] font-bold tracking-[-0.02em]">
        LeetRank
      </span>
    </span>
  );
}
