"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Exchange01Icon, UserSearch01Icon } from "@hugeicons/core-free-icons";

import type { ProfileSuggestion } from "@/lib/users/profiles";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const SEARCH_DELAY_MS = 250;

function ProfileSelector({
  label,
  name,
  placeholder,
  initialValue,
  initialQuery,
  initialError,
  excludedHandle,
  publicOnly,
  onValueChange,
}: {
  label: string;
  name: "left" | "right";
  placeholder: string;
  initialValue: ProfileSuggestion | null;
  initialQuery: string;
  initialError: string | null;
  excludedHandle: string | null;
  publicOnly: boolean;
  onValueChange: (value: ProfileSuggestion | null) => void;
}) {
  const [selected, setSelected] = useState<ProfileSuggestion | null>(initialValue);
  const [inputValue, setInputValue] = useState(
    initialValue?.leetcodeUsername ?? initialQuery,
  );
  const [results, setResults] = useState<ProfileSuggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [open, setOpen] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(initialError);
  const errorId = `${name}-profile-error`;

  useEffect(() => {
    const query = inputValue.trim();
    if (selected && query.toLowerCase() === selected.leetcodeUsername.toLowerCase()) {
      return;
    }
    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as { results: ProfileSuggestion[] };
        if (!controller.signal.aborted) {
          setResults(payload.results);
          setStatus("ready");
        }
      } catch (error) {
        if (!controller.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
          setStatus("error");
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [inputValue, selected]);

  const visibleResults = useMemo(
    () => results.filter((result) => result.handle !== excludedHandle),
    [excludedHandle, results],
  );
  const announcement =
    status === "loading"
      ? "Searching profiles"
      : status === "error"
        ? "Profile search is unavailable right now"
        : status === "ready"
          ? `${visibleResults.length} ${visibleResults.length === 1 ? "profile" : "profiles"} found`
          : inputValue.trim().length === 1
            ? "Type one more character to search"
            : "";

  function select(next: ProfileSuggestion | null) {
    setSelected(next);
    setInputValue(next?.leetcodeUsername ?? "");
    setResults([]);
    setStatus("idle");
    setOpen(false);
    setFieldError(null);
    onValueChange(next);
  }

  return (
    <div className="flex flex-col gap-2 bg-card p-4">
      <label
        htmlFor={`${name}-profile`}
        className="font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      <input type="hidden" name={name} value={selected?.handle ?? ""} />
      <Combobox
        items={visibleResults}
        filter={null}
        open={open}
        value={selected}
        inputValue={inputValue}
        itemToStringLabel={(profile: ProfileSuggestion) => profile.leetcodeUsername}
        isItemEqualToValue={(profile, value) => profile.handle === value.handle}
        onOpenChange={setOpen}
        onValueChange={select}
        onInputValueChange={(next, details) => {
          setInputValue(next);
          if (details.reason === "input-change" || details.reason === "input-clear") {
            setResults([]);
            setStatus("idle");
            setOpen(Boolean(next));
            setFieldError(null);
            if (selected) {
              setSelected(null);
              onValueChange(null);
            }
          }
        }}
      >
        <ComboboxInput
          id={`${name}-profile`}
          placeholder={placeholder}
          showClear={Boolean(inputValue)}
          autoComplete="off"
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? errorId : undefined}
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {status === "loading"
              ? "Searching…"
              : status === "error"
                ? "Search unavailable. Try again."
                : inputValue.trim().length < 2
                  ? "Type at least 2 characters."
                  : publicOnly
                    ? "No matching public profiles."
                    : "No matching verified profiles."}
          </ComboboxEmpty>
          <ComboboxList>
            <ComboboxCollection>
              {(profile: ProfileSuggestion) => (
                <ComboboxItem key={profile.handle} value={profile} className="items-start py-2">
                  <HugeiconsIcon
                    icon={UserSearch01Icon}
                    strokeWidth={2}
                    className="mt-0.5 text-muted-foreground"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs text-foreground">
                      @{profile.leetcodeUsername}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {profile.name}{profile.universityName ? ` · ${profile.universityName}` : ""}
                    </span>
                  </span>
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      {fieldError ? (
        <p id={errorId} className="text-xs text-destructive">
          {fieldError}
        </p>
      ) : null}
    </div>
  );
}

export function ProfileComparisonForm({
  initialLeft,
  initialRight,
  initialLeftQuery,
  initialRightQuery,
  leftError,
  rightError,
  publicOnly,
}: {
  initialLeft: ProfileSuggestion | null;
  initialRight: ProfileSuggestion | null;
  initialLeftQuery: string;
  initialRightQuery: string;
  leftError: string | null;
  rightError: string | null;
  publicOnly: boolean;
}) {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);
  const duplicate = Boolean(left && right && left.handle === right.handle);

  return (
    <div className="flex flex-col gap-3">
      <form
        action="/compare"
        method="get"
        className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-[1fr_1fr_auto]"
      >
        <ProfileSelector
          label="Left profile"
          name="left"
          placeholder="Search a LeetCode username"
          initialValue={initialLeft}
          initialQuery={initialLeftQuery}
          initialError={leftError}
          excludedHandle={right?.handle ?? null}
          publicOnly={publicOnly}
          onValueChange={setLeft}
        />
        <ProfileSelector
          label="Right profile"
          name="right"
          placeholder="Search another username"
          initialValue={initialRight}
          initialQuery={initialRightQuery}
          initialError={rightError}
          excludedHandle={left?.handle ?? null}
          publicOnly={publicOnly}
          onValueChange={setRight}
        />
        <div className="flex items-end bg-card p-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={!left || !right || duplicate}>
            <HugeiconsIcon icon={Exchange01Icon} strokeWidth={2} />
            Compare
          </Button>
        </div>
      </form>
      {duplicate ? (
        <p className="text-sm text-destructive" role="alert">Choose two different profiles.</p>
      ) : null}
    </div>
  );
}
