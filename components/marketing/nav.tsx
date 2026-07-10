import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { MotionButton } from "@/components/marketing/motion/motion-button";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { nav } from "@/lib/marketing/content";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" aria-label="LeetRank home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <MotionButton nativeButton={false} render={<Link href={nav.cta.href} />}>
            {nav.cta.label}
          </MotionButton>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
