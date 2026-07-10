"use client";

import { Button } from "@/components/ui/button";

export function MotionButton(
  props: React.ComponentProps<typeof Button>,
) {
  // Keep Base UI's polymorphic `render` contract intact. Wrapping Button with
  // motion.create() prevents Link-rendered CTAs from navigating reliably.
  return <Button {...props} />;
}
