import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { footer } from "@/lib/marketing/content";

export function Footer() {
  return (
    <footer>
      <div className="px-6 py-14">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-3">
            <Wordmark />
            <p className="max-w-xs text-sm text-muted-foreground">
              {footer.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-14">
            {footer.columns.map((column) => (
              <div key={column.heading} className="flex flex-col gap-3">
                <p className="font-mono text-[0.68rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  {column.heading}
                </p>
                <div className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 font-mono text-[0.68rem] tracking-[0.06em] text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} LeetRank</span>
          <span>Not affiliated with LeetCode.</span>
        </div>
      </div>
    </footer>
  );
}
