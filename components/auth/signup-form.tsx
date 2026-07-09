"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  User02Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { signupSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword", string>
>;

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
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

    authClient.signUp.email(
      {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
      {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onSuccess: () => {
          toast.success("Account created. Welcome to LeetRank.");
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message ?? "Couldn't create your account.");
        },
      },
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            aria-invalid={Boolean(fieldErrors.name)}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </InputGroup>
        {fieldErrors.name ? (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        ) : null}
      </div>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </InputGroup>
        {fieldErrors.confirmPassword ? (
          <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
        {isPending ? <Spinner /> : "Create account"}
      </Button>
    </form>
  );
}
