import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { footer } from "@/lib/marketing/content";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-3">
            <Wordmark />
            <p className="max-w-xs text-sm text-muted-foreground">
              {footer.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footer.columns.map((column) => (
              <div key={column.heading} className="flex flex-col gap-2">
                <p className="font-heading text-sm font-semibold text-foreground">
                  {column.heading}
                </p>
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LeetRank. Not affiliated with LeetCode.
        </div>
      </div>
    </footer>
  );
}
