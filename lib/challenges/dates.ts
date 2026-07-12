const DAY_MS = 24 * 60 * 60 * 1000;

export function utcDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcDateFromInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return utcDateInput(date) === value ? date : null;
}

export function todayUtcDate(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function inclusiveDays(startsOn: Date, endsOn: Date): number {
  return Math.floor((endsOn.getTime() - startsOn.getTime()) / DAY_MS) + 1;
}

export function isBeforeUtcDay(left: Date, right: Date): boolean {
  return todayUtcDate(left).getTime() < todayUtcDate(right).getTime();
}

export function isAfterUtcDay(left: Date, right: Date): boolean {
  return todayUtcDate(left).getTime() > todayUtcDate(right).getTime();
}

export function challengeStatus(
  startsOn: Date,
  endsOn: Date,
  now = new Date(),
): "upcoming" | "active" | "ended" {
  const today = todayUtcDate(now).getTime();
  if (today < startsOn.getTime()) return "upcoming";
  if (today > endsOn.getTime()) return "ended";
  return "active";
}

export function formatChallengeDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
