import { cn } from "@/lib/utils";
import type { SubmissionDay } from "@/lib/marketing/placeholder-data";

function intensityClass(count: number) {
  if (count === 0) return "bg-muted";
  if (count <= 2) return "bg-primary/25";
  if (count <= 4) return "bg-primary/50";
  if (count <= 6) return "bg-primary/75";
  return "bg-primary";
}

export function AnalyticsHeatmap({ days }: { days: SubmissionDay[] }) {
  const weeks: SubmissionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {weeks.map((week, i) => (
        <div key={i} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
              className={cn(
                "size-3 rounded-[2px]",
                intensityClass(day.count),
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
