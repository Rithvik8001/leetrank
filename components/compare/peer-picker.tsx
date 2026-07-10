"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";

import {
  Combobox, ComboboxCollection, ComboboxContent, ComboboxEmpty,
  ComboboxInput, ComboboxItem, ComboboxList,
} from "@/components/ui/combobox";

type Peer = { id: string; name: string; username: string };

export function PeerPicker({ peers, selectedId }: { peers: Peer[]; selectedId: string | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Peer | null>(
    peers.find((peer) => peer.id === selectedId) ?? null,
  );

  return (
    <Combobox
      items={peers}
      value={selected}
      onValueChange={(peer) => {
        setSelected(peer);
        if (peer) router.push(`/compare?user=${encodeURIComponent(peer.id)}`);
      }}
    >
      <ComboboxInput placeholder="Search verified classmates" className="max-w-md" />
      <ComboboxContent>
        <ComboboxEmpty>No verified classmates found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(peer: Peer) => (
              <ComboboxItem key={peer.id} value={peer}>
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="text-muted-foreground" />
                <span className="min-w-0"><span className="block truncate">{peer.name}</span><span className="block truncate font-mono text-xs text-muted-foreground">@{peer.username}</span></span>
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
