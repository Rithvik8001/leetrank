import { SectionLabel } from "@/components/marketing/section-label";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata = { title: "Security" };

export default function SecurityPage() {
  return <div className="px-6 py-12">
    <SectionLabel>Account settings</SectionLabel>
    <div className="mt-5 max-w-xl">
      <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em]">Security</h1>
      <p className="mt-3 text-sm text-muted-foreground">Change your password and sign out every other active session.</p>
    </div>
    <section className="mt-8 max-w-lg rounded-md border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Change password</h2>
      <p className="mt-1 text-sm text-muted-foreground">Use 8–128 characters. Your current session stays active.</p>
      <div className="mt-6"><ChangePasswordForm /></div>
    </section>
  </div>;
}
