import { z } from "zod";

import {
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_METRICS,
  CHALLENGE_TITLE_MAX,
  MAX_CHALLENGE_DAYS,
  MIN_CHALLENGE_DAYS,
} from "@/lib/challenges/constants";
import { inclusiveDays, utcDateFromInput } from "@/lib/challenges/dates";

export const challengeFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Challenge title must be at least 3 characters.")
      .max(CHALLENGE_TITLE_MAX, `Challenge title must be ${CHALLENGE_TITLE_MAX} characters or fewer.`),
    description: z
      .string()
      .trim()
      .max(
        CHALLENGE_DESCRIPTION_MAX,
        `Description must be ${CHALLENGE_DESCRIPTION_MAX} characters or fewer.`,
      )
      .optional()
      .transform((value) => (value ? value : null)),
    metric: z.enum(CHALLENGE_METRICS),
    startsOn: z.string().refine((value) => utcDateFromInput(value) != null, "Enter a valid start date."),
    endsOn: z.string().refine((value) => utcDateFromInput(value) != null, "Enter a valid end date."),
  })
  .superRefine((value, ctx) => {
    const startsOn = utcDateFromInput(value.startsOn);
    const endsOn = utcDateFromInput(value.endsOn);
    if (!startsOn || !endsOn) return;

    const days = inclusiveDays(startsOn, endsOn);
    if (days < MIN_CHALLENGE_DAYS) {
      ctx.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "End date must be on or after the start date.",
      });
    }
    if (days > MAX_CHALLENGE_DAYS) {
      ctx.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: `Challenges can run for at most ${MAX_CHALLENGE_DAYS} days.`,
      });
    }
  });

export type ChallengeFormValues = z.input<typeof challengeFormSchema>;
export type ParsedChallengeFormValues = z.output<typeof challengeFormSchema>;

export function challengeDates(value: Pick<ParsedChallengeFormValues, "startsOn" | "endsOn">) {
  const startsOn = utcDateFromInput(value.startsOn);
  const endsOn = utcDateFromInput(value.endsOn);
  if (!startsOn || !endsOn) throw new Error("Invalid challenge dates.");
  return { startsOn, endsOn };
}
