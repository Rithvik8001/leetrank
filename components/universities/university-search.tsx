"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, GraduationCapIcon } from "@hugeicons/core-free-icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const OWNERSHIP_LABEL: Record<string, string> = {
  PUBLIC: "Public",
  PRIVATE_NONPROFIT: "Private nonprofit",
  PRIVATE_FOR_PROFIT: "Private for-profit",
};

type University = {
  slug: string;
  name: string;
  city: string;
  state: string;
  ownershipType: string | null;
};

export function UniversitySearch({
  universities,
}: {
  universities: University[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (university) =>
        university.name.toLowerCase().includes(q) ||
        university.city.toLowerCase().includes(q) ||
        university.state.toLowerCase().includes(q),
    );
  }, [universities, query]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by name, city, or state"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <span className="hidden font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground/70 uppercase tabular-nums sm:inline">
          {filtered.length} results
        </span>
      </div>

      {filtered.length === 0 ? (
        <Empty className="rounded-md border border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={GraduationCapIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No universities found</EmptyTitle>
            <EmptyDescription>
              Try a different name, city, or state.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {filtered.map((university) => (
            <Link
              key={university.slug}
              href={`/universities/${university.slug}`}
              className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {university.name}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {university.city}, {university.state}
                </p>
              </div>
              {university.ownershipType ? (
                <span className="shrink-0 font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
                  {OWNERSHIP_LABEL[university.ownershipType] ??
                    university.ownershipType}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
