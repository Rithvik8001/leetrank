"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

type Point = { capturedAt: string; totalSolved: number };

function shortDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(iso),
  );
}

export function ProgressChart({ points }: { points: Point[] }) {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId();

  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center px-6 text-center font-mono text-xs text-muted-foreground">
        Building your history — check back after a few daily syncs.
      </div>
    );
  }

  const values = points.map((point) => point.totalSolved);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (i: number) => (i / (points.length - 1)) * 100;
  const y = (value: number) => 38 - ((value - min) / range) * 36;

  const coords = points.map((point, i) => `${x(i)},${y(point.totalSolved)}`);
  const line = `M ${coords.join(" L ")}`;
  const area = `M ${coords.join(" L ")} L 100,40 L 0,40 Z`;
  const lastY = y(values[values.length - 1]);

  const first = points[0];
  const last = points[points.length - 1];
  const gained = last.totalSolved - first.totalSolved;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-40">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`Problems solved rose by ${gained} from ${shortDate(first.capturedAt)} to ${shortDate(last.capturedAt)}.`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill={`url(#${gradientId})`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="var(--color-foreground)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.165, 0.84, 0.44, 1] }}
          />
          <motion.circle
            cx={100}
            cy={lastY}
            r={2}
            fill="var(--color-gold)"
            vectorEffect="non-scaling-stroke"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
        </svg>
        <span className="pointer-events-none absolute top-0 left-0 font-mono text-[0.6rem] text-muted-foreground/70 tabular-nums">
          {max.toLocaleString()}
        </span>
        <span className="pointer-events-none absolute bottom-0 left-0 font-mono text-[0.6rem] text-muted-foreground/70 tabular-nums">
          {min.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between font-mono text-[0.62rem] text-muted-foreground tabular-nums">
        <span>{shortDate(first.capturedAt)}</span>
        <span>{shortDate(last.capturedAt)}</span>
      </div>
    </div>
  );
}
