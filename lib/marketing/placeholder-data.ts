export type RatingDelta = {
  value: number;
  direction: "up" | "down" | "flat";
};

export type LeaderboardEntry = {
  rank: number;
  studentName: string;
  handle: string;
  avatarUrl: string | null;
  university: string;
  problemsSolved: number;
  ratingDelta: RatingDelta;
};

export const heroLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    studentName: "Ava Chen",
    handle: "avachen",
    avatarUrl: null,
    university: "Northbridge Tech",
    problemsSolved: 812,
    ratingDelta: { value: 37, direction: "up" },
  },
  {
    rank: 2,
    studentName: "Marcus Reyes",
    handle: "mreyes",
    avatarUrl: null,
    university: "Riverside State",
    problemsSolved: 795,
    ratingDelta: { value: 12, direction: "up" },
  },
  {
    rank: 3,
    studentName: "Priya Nair",
    handle: "priyan",
    avatarUrl: null,
    university: "Cascade Institute of Technology",
    problemsSolved: 780,
    ratingDelta: { value: 4, direction: "down" },
  },
  {
    rank: 4,
    studentName: "Jonah Kessler",
    handle: "jkessler",
    avatarUrl: null,
    university: "Fairview University",
    problemsSolved: 764,
    ratingDelta: { value: 0, direction: "flat" },
  },
  {
    rank: 5,
    studentName: "Sofia Marin",
    handle: "smarin",
    avatarUrl: null,
    university: "Lakeshore Polytechnic",
    problemsSolved: 751,
    ratingDelta: { value: 21, direction: "up" },
  },
];

export type SubmissionDay = {
  date: string;
  count: number;
};

/** Deterministic pseudo-random generator so the marketing preview renders identically on every request. */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSubmissionHeatmap(days: number): SubmissionDay[] {
  const today = new Date("2026-07-07");
  const result: SubmissionDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const noise = seededRandom(i * 17.31);
    const count = noise > 0.25 ? Math.round(noise * 8) : 0;
    result.push({ date: date.toISOString().slice(0, 10), count });
  }
  return result;
}

export const submissionHeatmap: SubmissionDay[] = generateSubmissionHeatmap(120);

export type RatingPoint = {
  date: string;
  rating: number;
};

export const ratingHistory: RatingPoint[] = [
  { date: "2026-01", rating: 1200 },
  { date: "2026-02", rating: 1265 },
  { date: "2026-02", rating: 1240 },
  { date: "2026-03", rating: 1330 },
  { date: "2026-03", rating: 1385 },
  { date: "2026-04", rating: 1360 },
  { date: "2026-05", rating: 1445 },
  { date: "2026-05", rating: 1500 },
  { date: "2026-06", rating: 1552 },
  { date: "2026-07", rating: 1580 },
];
