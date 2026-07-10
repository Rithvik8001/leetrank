"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

export type TrendPoint = { t: string; value: number };

function shortDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(iso),
  );
}

// A hand-rolled Ink & Brass line chart: foreground line, gold area + endpoint,
// reduced-motion aware, with min/max and date-range captions. Shared by the
// dashboard and public-profile history sections (no charting lib).
export function TrendChart({
  points,
  ariaLabel,
  formatValue = (n) => n.toLocaleString(),
  empty = "Building your history — check back after a few daily syncs.",
  height = "h-44",
}: {
  points: TrendPoint[];
  ariaLabel: string;
  formatValue?: (value: number) => string;
  empty?: string;
  height?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId();

  if (points.length < 2) {
    return (
      <div className={`flex ${height} items-center justify-center px-6 text-center font-mono text-xs text-muted-foreground`}>
        {empty}
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (i: number) => (i / (points.length - 1)) * 100;
  const y = (value: number) => 38 - ((value - min) / range) * 36;

  const coords = points.map((point, i) => `${x(i)},${y(point.value)}`);
  const line = `M ${coords.join(" L ")}`;
  const area = `M ${coords.join(" L ")} L 100,40 L 0,40 Z`;
  const lastY = y(values[values.length - 1]);

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="flex flex-col gap-2">
      <div className={`relative ${height}`}>
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={ariaLabel}
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
          {formatValue(max)}
        </span>
        <span className="pointer-events-none absolute bottom-0 left-0 font-mono text-[0.6rem] text-muted-foreground/70 tabular-nums">
          {formatValue(min)}
        </span>
      </div>
      <div className="flex justify-between font-mono text-[0.62rem] text-muted-foreground tabular-nums">
        <span>{shortDate(first.t)}</span>
        <span>{shortDate(last.t)}</span>
      </div>
    </div>
  );
}
