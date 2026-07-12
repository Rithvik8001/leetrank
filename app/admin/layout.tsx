import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/clubs/auth";
export default async function AdminLayout({children}:{children:ReactNode}) { if(!await requirePlatformAdmin()) redirect("/dashboard"); return <div className="mx-auto min-h-screen max-w-6xl border-x border-border">{children}</div>; }
