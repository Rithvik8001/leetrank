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
  excludedHandle,
  onValueChange,
}: {
  label: string;
  name: "left" | "right";
  placeholder: string;
  initialValue: ProfileSuggestion | null;
  excludedHandle: string | null;
  onValueChange: (value: ProfileSuggestion | null) => void;
}) {
  const [selected, setSelected] = useState<ProfileSuggestion | null>(initialValue);
  const [inputValue, setInputValue] = useState(initialValue?.leetcodeUsername ?? "");
  const [results, setResults] = useState<ProfileSuggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

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
        value={selected}
        inputValue={inputValue}
        itemToStringLabel={(profile: ProfileSuggestion) => profile.leetcodeUsername}
        isItemEqualToValue={(profile, value) => profile.handle === value.handle}
        onValueChange={select}
        onInputValueChange={(next, details) => {
          setInputValue(next);
          if (details.reason === "input-change" || details.reason === "input-clear") {
            setResults([]);
            setStatus("idle");
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
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {status === "loading"
              ? "Searching…"
              : status === "error"
                ? "Search unavailable. Try again."
                : inputValue.trim().length < 2
                  ? "Type at least 2 characters."
                  : "No matching profiles."}
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
    </div>
  );
}

export function ProfileComparisonForm({
  initialLeft,
  initialRight,
  errorMessage,
}: {
  initialLeft: ProfileSuggestion | null;
  initialRight: ProfileSuggestion | null;
  errorMessage?: string | null;
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
          excludedHandle={right?.handle ?? null}
          onValueChange={setLeft}
        />
        <ProfileSelector
          label="Right profile"
          name="right"
          placeholder="Search another username"
          initialValue={initialRight}
          excludedHandle={left?.handle ?? null}
          onValueChange={setRight}
        />
        <div className="flex items-end bg-card p-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={!left || !right || duplicate}>
            <HugeiconsIcon icon={Exchange01Icon} strokeWidth={2} />
            Compare
          </Button>
        </div>
      </form>
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">{errorMessage}</p>
      ) : duplicate ? (
        <p className="text-sm text-destructive" role="alert">Choose two different profiles.</p>
      ) : null}
    </div>
  );
}
