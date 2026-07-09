"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      toast.error(result.error.issues[0]?.message ?? "Check the highlighted fields.");
      return;
    }
    setFieldErrors({});

    authClient.signIn.email(result.data, {
      onRequest: () => setIsPending(true),
      onResponse: () => setIsPending(false),
      onSuccess: () => {
        toast.success("Welcome back.");
        router.push("/");
        router.refresh();
      },
      onError: (ctx) => {
        toast.error(ctx.error.message ?? "Couldn't log you in. Check your credentials.");
      },
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            aria-invalid={Boolean(fieldErrors.email)}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </InputGroup>
        {fieldErrors.email ? (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(fieldErrors.password)}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : ViewIcon}
                strokeWidth={2}
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
        {isPending ? <Spinner /> : "Log in"}
      </Button>
    </form>
  );
}
