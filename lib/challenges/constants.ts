export const MAX_ACTIVE_UPCOMING_CHALLENGES = 10;
export const MAX_CHALLENGE_DAYS = 90;
export const MIN_CHALLENGE_DAYS = 1;
export const CHALLENGE_TITLE_MAX = 80;
export const CHALLENGE_DESCRIPTION_MAX = 240;

export const CHALLENGE_METRICS = [
  "TOTAL_SOLVED",
  "HARD_SOLVED",
  "CONTEST_RATING",
] as const;

export type ChallengeMetricValue = (typeof CHALLENGE_METRICS)[number];

export const CHALLENGE_METRIC_LABELS: Record<ChallengeMetricValue, string> = {
  TOTAL_SOLVED: "Problems solved",
  HARD_SOLVED: "Hard solved",
  CONTEST_RATING: "Contest rating",
};

export const CHALLENGE_METRIC_SHORT_LABELS: Record<ChallengeMetricValue, string> = {
  TOTAL_SOLVED: "Total",
  HARD_SOLVED: "Hard",
  CONTEST_RATING: "Rating",
};
