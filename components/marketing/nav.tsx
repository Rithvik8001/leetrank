import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { nav } from "@/lib/marketing/content";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" aria-label="LeetRank home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button nativeButton={false} render={<Link href={nav.cta.href} />}>
            {nav.cta.label}
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
