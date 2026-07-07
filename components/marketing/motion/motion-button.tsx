"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

const MotionButtonBase = motion.create(Button);

export function MotionButton(
  props: React.ComponentProps<typeof MotionButtonBase>,
) {
  return (
    <MotionButtonBase
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    />
  );
}
