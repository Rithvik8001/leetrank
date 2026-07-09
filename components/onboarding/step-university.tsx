"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GraduationCapIcon } from "@hugeicons/core-free-icons";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxCollection,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

type University = { id: string; name: string; city: string; state: string };
type ComboboxOption = { value: string; label: string };

export function StepUniversity({
  universities,
  defaultUniversityId,
  isPending,
  onSubmit,
}: {
  universities: University[];
  defaultUniversityId: string | null;
  isPending: boolean;
  onSubmit: (universityId: string) => void;
}) {
  const items: ComboboxOption[] = universities.map((university) => ({
    value: university.id,
    label: `${university.name} — ${university.city}, ${university.state}`,
  }));

  const [selected, setSelected] = useState<ComboboxOption | null>(
    items.find((item) => item.value === defaultUniversityId) ?? null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>University</Label>
        <Combobox
          items={items}
          value={selected}
          onValueChange={(value) => setSelected(value)}
        >
          <ComboboxInput placeholder="Search for your university" />
          <ComboboxContent>
            <ComboboxEmpty>No universities found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxCollection>
                {(item: ComboboxOption) => (
                  <ComboboxItem key={item.value} value={item}>
                    <HugeiconsIcon
                      icon={GraduationCapIcon}
                      strokeWidth={2}
                      className="text-muted-foreground"
                    />
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <Button
        size="lg"
        className="mt-2 w-full"
        disabled={!selected || isPending}
        onClick={() => selected && onSubmit(selected.value)}
      >
        {isPending ? <Spinner /> : "Continue"}
      </Button>
    </div>
  );
}
