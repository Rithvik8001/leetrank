"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { TrendChart, type TrendPoint } from "@/components/charts/trend-chart";

export type HistoryPoint = {
  capturedAt: string;
  totalSolved: number;
  hardSolved: number;
  contestRating: number | null;
};

type Metric = {
  key: string;
  label: string;
  noun: string;
  points: TrendPoint[];
};

function series(rows: HistoryPoint[], pick: (row: HistoryPoint) => number | null): TrendPoint[] {
  return rows.flatMap((row) => {
    const value = pick(row);
    return value == null ? [] : [{ t: row.capturedAt, value }];
  });
}

function signed(n: number): string {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString();
}

export function HistoryCharts({
  rows,
  rangeLabel,
  className,
}: {
  rows: HistoryPoint[];
  rangeLabel: string;
  className?: string;
}) {
  const metrics: Metric[] = [
    { key: "solved", label: "Solved", noun: "Problems solved", points: series(rows, (r) => r.totalSolved) },
    { key: "rating", label: "Rating", noun: "Contest rating", points: series(rows, (r) => r.contestRating) },
    { key: "hard", label: "Hard", noun: "Hard solved", points: series(rows, (r) => r.hardSolved) },
  ];
  const available = metrics.filter((metric) => metric.points.length >= 2);
  const [activeKey, setActiveKey] = useState(available[0]?.key ?? "solved");
  const active = available.find((metric) => metric.key === activeKey) ?? available[0];

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-foreground uppercase">
          Your history · {rangeLabel}
        </span>
        {available.length > 1 ? (
          <div className="flex gap-1 rounded-md border border-border bg-muted/20 p-1" aria-label="Chart metric">
            {available.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => setActiveKey(metric.key)}
                aria-pressed={metric.key === active?.key}
                className={cn(
                  "rounded-sm px-3 py-1 font-mono text-[0.66rem] tracking-[0.08em] transition-colors",
                  metric.key === active?.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {metric.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 p-5">
        {active ? (
          <>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                {active.points[active.points.length - 1].value.toLocaleString()}
              </span>
              {(() => {
                const delta = active.points[active.points.length - 1].value - active.points[0].value;
                return (
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {signed(delta)} over {rangeLabel}
                  </span>
                );
              })()}
            </div>
            <TrendChart
              key={active.key}
              points={active.points}
              ariaLabel={`${active.noun} over ${rangeLabel}.`}
            />
          </>
        ) : (
          <TrendChart points={[]} ariaLabel="No history yet." />
        )}
      </div>
    </div>
  );
}
