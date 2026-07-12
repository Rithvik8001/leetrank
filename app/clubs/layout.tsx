import type { ReactNode } from "react";

import { AuthHeader } from "@/components/auth/auth-header";

export default function ClubsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
      <AuthHeader
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/universities", label: "Universities" },
          { href: "/groups", label: "Groups" },
        ]}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
