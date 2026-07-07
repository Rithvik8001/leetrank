"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export function CountUp({
  value,
  className,
  duration = 1.2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (shouldReduceMotion || !isInView) {
      node.textContent = value.toLocaleString("en-US");
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.19, 1, 0.22, 1],
      onUpdate(latest) {
        node.textContent = Math.round(latest).toLocaleString("en-US");
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
