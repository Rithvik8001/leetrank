"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import {
  selectUniversity,
  setLeetcodeUsernameAndGenerateCode,
  verifyLeetcodeBio,
  completeOnboarding,
} from "@/app/(auth)/onboarding/actions";
import { StepUniversity } from "@/components/onboarding/step-university";
import { StepLeetcodeUsername } from "@/components/onboarding/step-leetcode-username";
import { StepVerifyInstructions } from "@/components/onboarding/step-verify-instructions";

type University = { id: string; name: string; city: string; state: string };
type Step = "university" | "leetcode-username" | "verify";

const STEP_ORDER: Step[] = ["university", "leetcode-username", "verify"];

const STEP_COPY: Record<Step, { eyebrow: string; heading: string; description: string }> = {
  university: {
    eyebrow: "Step 1 of 3",
    heading: "Choose your university",
    description: "We'll use this to rank you on your school's leaderboard.",
  },
  "leetcode-username": {
    eyebrow: "Step 2 of 3",
    heading: "Link your LeetCode account",
    description: "Enter your LeetCode username to generate a verification code.",
  },
  verify: {
    eyebrow: "Step 3 of 3",
    heading: "Verify your account",
    description: "Add the code to your LeetCode bio, then confirm below.",
  },
};

export function OnboardingWizard({
  universities,
  initialUniversityId,
  initialLeetcodeUsername,
  initialLeetcodeVerified,
}: {
  universities: University[];
  initialUniversityId: string | null;
  initialLeetcodeUsername: string | null;
  initialLeetcodeVerified: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFinishing, setIsFinishing] = useState(initialLeetcodeVerified);

  const [step, setStep] = useState<Step>(
    initialUniversityId ? "leetcode-username" : "university",
  );
  const [leetcodeUsername, setLeetcodeUsername] = useState<string | null>(
    initialLeetcodeUsername,
  );
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!initialLeetcodeVerified) return;
    startTransition(async () => {
      const result = await completeOnboarding();
      if (!result.ok) {
        toast.error(result.error);
        setIsFinishing(false);
        return;
      }
      router.replace("/dashboard");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectUniversity(universityId: string) {
    startTransition(async () => {
      const result = await selectUniversity(universityId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setStep("leetcode-username");
    });
  }

  function handleSetUsername(username: string) {
    startTransition(async () => {
      const result = await setLeetcodeUsernameAndGenerateCode(username);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setLeetcodeUsername(username);
      setCode(result.data.code);
      setStep("verify");
    });
  }

  function handleVerify() {
    startTransition(async () => {
      const result = await verifyLeetcodeBio();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const completed = await completeOnboarding();
      if (!completed.ok) {
        toast.error(completed.error);
        return;
      }
      toast.success("You're verified. Welcome to LeetRank.");
      router.replace("/dashboard");
    });
  }

  if (isFinishing) {
    return null;
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const copy = STEP_COPY[step];

  return (
    <AuthCard
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      description={copy.description}
      footer={
        <span className="flex items-center justify-center gap-1.5">
          {STEP_ORDER.map((s, index) => (
            <span
              key={s}
              className={`h-1 w-7 rounded-full transition-colors ${
                index <= stepIndex ? "bg-gold" : "bg-border"
              }`}
            />
          ))}
        </span>
      }
    >
      {step === "university" ? (
        <StepUniversity
          universities={universities}
          defaultUniversityId={initialUniversityId}
          isPending={isPending}
          onSubmit={handleSelectUniversity}
        />
      ) : null}

      {step === "leetcode-username" ? (
        <StepLeetcodeUsername
          defaultUsername={leetcodeUsername}
          isPending={isPending}
          onSubmit={handleSetUsername}
        />
      ) : null}

      {step === "verify" && code ? (
        <StepVerifyInstructions
          code={code}
          isPending={isPending}
          onVerify={handleVerify}
        />
      ) : null}
    </AuthCard>
  );
}
