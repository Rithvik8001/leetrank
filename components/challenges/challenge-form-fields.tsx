"use client";

import type { ChallengeFormValues } from "@/lib/challenges/schemas";
import {
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_METRIC_LABELS,
  CHALLENGE_METRICS,
  CHALLENGE_TITLE_MAX,
} from "@/lib/challenges/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ChallengeFormFields({
  values,
  onChange,
  disabled,
}: {
  values: ChallengeFormValues;
  onChange: (values: ChallengeFormValues) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="challenge-title">Title</Label>
        <Input
          id="challenge-title"
          value={values.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
          placeholder="July Hard Sprint"
          maxLength={CHALLENGE_TITLE_MAX}
          disabled={disabled}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="challenge-description">Description</Label>
        <Textarea
          id="challenge-description"
          value={values.description ?? ""}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          placeholder="Push hard-problem progress before the next contest."
          maxLength={CHALLENGE_DESCRIPTION_MAX}
          disabled={disabled}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="challenge-start">Start date</Label>
          <Input
            id="challenge-start"
            type="date"
            value={values.startsOn}
            onChange={(event) => onChange({ ...values, startsOn: event.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="challenge-end">End date</Label>
          <Input
            id="challenge-end"
            type="date"
            value={values.endsOn}
            onChange={(event) => onChange({ ...values, endsOn: event.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="challenge-metric">Scoring metric</Label>
        <select
          id="challenge-metric"
          value={values.metric}
          onChange={(event) =>
            onChange({
              ...values,
              metric: event.target.value as ChallengeFormValues["metric"],
            })
          }
          disabled={disabled}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {CHALLENGE_METRICS.map((metric) => (
            <option key={metric} value={metric}>
              {CHALLENGE_METRIC_LABELS[metric]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
