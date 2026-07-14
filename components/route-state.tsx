import { SectionLabel } from "@/components/marketing/section-label";

export function RouteLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="px-6 py-12" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-5 h-12 w-full max-w-xl animate-pulse rounded-sm bg-muted motion-reduce:animate-none" />
      <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded-sm bg-muted motion-reduce:animate-none" />
      <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse bg-card p-5 motion-reduce:animate-none"><div className="h-3 w-20 rounded-sm bg-muted" /><div className="mt-8 h-8 w-24 rounded-sm bg-muted" /></div>)}
      </div>
      <div className="mt-8 divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
        {[0, 1, 2, 3].map((item) => <div key={item} className="flex h-16 items-center justify-between px-5"><div className="h-4 w-40 animate-pulse rounded-sm bg-muted motion-reduce:animate-none" /><div className="h-4 w-16 animate-pulse rounded-sm bg-muted motion-reduce:animate-none" /></div>)}
      </div>
    </div>
  );
}

