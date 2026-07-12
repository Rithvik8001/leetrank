import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthHeader } from "@/components/auth/auth-header";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
      <AuthHeader
        links={[
          { href: "/clubs", label: "Clubs" },
          { href: "/universities", label: "Universities" },
          { href: "/groups", label: "Groups" },
        ]}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
