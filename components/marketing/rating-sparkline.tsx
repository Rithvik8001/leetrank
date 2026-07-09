"use client";

import { motion, useReducedMotion } from "motion/react";

export function RatingSparkline({ points }: { points: { rating: number }[] }) {
  const shouldReduceMotion = useReducedMotion();
  const values = points.map((p) => p.rating);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = values.map((value, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 32 - ((value - min) / range) * 32;
    return `${x},${y}`;
  });

  const path = `M ${coords.join(" L ")}`;
  const lastUp = values[values.length - 1] >= values[values.length - 2];

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden="true"
    >
      <motion.path
        d={path}
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.6, ease: [0.165, 0.84, 0.44, 1] }}
      />
      <motion.circle
        cx={100}
        cy={32 - ((values[values.length - 1] - min) / range) * 32}
        r={1.75}
        fill={lastUp ? "var(--color-rank-up)" : "var(--color-rank-down)"}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4, ease: [0.165, 0.84, 0.44, 1], delay: 1.4 }}
      />
    </svg>
  );
}
