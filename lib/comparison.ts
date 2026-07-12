export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type DifficultyCounts = {
  total: number | null;
  easy: number | null;
  medium: number | null;
  hard: number | null;
};

export type DifficultyDistribution = Record<Difficulty, number>;

export function difficultyDistribution(
  counts: DifficultyCounts,
): DifficultyDistribution | null {
  if (counts.total == null || counts.total <= 0) return null;
  return {
    Easy: ((counts.easy ?? 0) / counts.total) * 100,
    Medium: ((counts.medium ?? 0) / counts.total) * 100,
    Hard: ((counts.hard ?? 0) / counts.total) * 100,
  };
}

export function difficultyInsights(
  left: DifficultyDistribution | null,
  right: DifficultyDistribution | null,
) {
  if (!left || !right) return { left: null, right: null };
  const gaps = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    gap: left[difficulty] - right[difficulty],
  }));
  if (gaps.every(({ gap }) => Math.abs(gap) < 0.01)) {
    return { left: null, right: null };
  }
  const strongest = [...gaps].sort((a, b) => b.gap - a.gap)[0];
  const weakest = [...gaps].sort((a, b) => a.gap - b.gap)[0];
  return {
    left: {
      stronger: strongest.gap > 0 ? strongest.difficulty : null,
      weaker: weakest.gap < 0 ? weakest.difficulty : null,
    },
    right: {
      stronger: weakest.gap < 0 ? weakest.difficulty : null,
      weaker: strongest.gap > 0 ? strongest.difficulty : null,
    },
  };
}

export function comparisonUrl(left: string, right?: string) {
  const params = new URLSearchParams({ left });
  if (right) params.set("right", right);
  return `/compare?${params.toString()}`;
}
