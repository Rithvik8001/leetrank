"use client";

import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type Field = "currentPassword" | "newPassword" | "confirmPassword";

export function ChangePasswordForm() {
  const [values, setValues] = useState<Record<Field, string>>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, setPending] = useState(false);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      toast.error(parsed.error.issues[0]?.message ?? "Check the highlighted fields.");
      return;
    }
    setErrors({});
    setPending(true);
    const result = await authClient.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (result.error) {
      toast.error("Password could not be changed. Check your current password and try again.");
      return;
    }
    setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Password changed. Other sessions were signed out.");
  }

  const fields: { field: Field; label: string; autoComplete: string }[] = [
    { field: "currentPassword", label: "Current password", autoComplete: "current-password" },
    { field: "newPassword", label: "New password", autoComplete: "new-password" },
    { field: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
  ];

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {fields.map(({ field, label, autoComplete }) => (
        <div key={field} className="flex flex-col gap-1.5">
          <Label htmlFor={field}>{label}</Label>
          <Input id={field} name={field} type="password" autoComplete={autoComplete} value={values[field]} onChange={(event) => update(field, event.target.value)} aria-invalid={Boolean(errors[field])} />
          {errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null}
        </div>
      ))}
      <Button type="submit" size="lg" className="mt-2" disabled={pending}>{pending ? <Spinner /> : "Change password"}</Button>
    </form>
  );
}
