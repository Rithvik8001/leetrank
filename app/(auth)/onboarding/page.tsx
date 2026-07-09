import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllUniversities } from "@/lib/universities/queries";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const universities = await getAllUniversities();

  return (
    <OnboardingWizard
      universities={universities.map((university) => ({
        id: university.id,
        name: university.name,
        city: university.city,
        state: university.state,
      }))}
      initialUniversityId={user.universityId}
      initialLeetcodeUsername={user.leetcodeUsername}
      initialLeetcodeVerified={user.leetcodeVerified}
    />
  );
}
