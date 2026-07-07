"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";

import { MotionButton } from "@/components/marketing/motion/motion-button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // resolvedTheme is undefined on the server and during the first client
  // render, so we defer rendering the theme-dependent icon until after
  // mount to avoid a hydration mismatch. useSyncExternalStore lets us read
  // "has hydrated" without a setState-in-effect render cascade.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <MotionButton
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
      )}
      <span className="sr-only">Toggle theme</span>
    </MotionButton>
  );
}
