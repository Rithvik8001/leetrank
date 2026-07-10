const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
];

// A compact "2 days ago" / "just now" label. Past dates read as "… ago"; future
// dates (clock skew) read as "in …". Anything under a minute is "just now".
export function formatRelativeTime(from: Date, now = new Date()): string {
  const diff = from.getTime() - now.getTime(); // negative = in the past
  const abs = Math.abs(diff);

  for (const { unit, ms } of UNITS) {
    if (abs >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}
