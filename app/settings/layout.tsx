import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/auth/auth-header";
import { auth } from "@/lib/auth";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  if (!await auth.api.getSession({ headers: await headers() })) redirect("/login");
  return <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
    <AuthHeader links={[{ href: "/dashboard", label: "Dashboard" }, { href: "/clubs", label: "Clubs" }, { href: "/groups", label: "Groups" }]} />
    <main className="flex-1">{children}</main>
  </div>;
}
