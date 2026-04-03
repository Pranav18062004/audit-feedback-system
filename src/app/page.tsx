import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { StoreCard } from "@/components/store-card";
import { getActiveStores } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stores = await getActiveStores();

  return (
    <div className="space-y-8 pb-8">
      <section className="glass-panel rounded-[36px] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <SectionHeading
            eyebrow="Anonymous feedback"
            title="Capture store audits in under a minute."
            description="Choose a store, tap quick 1-10 ratings, and submit optional comments without signing in or sharing any personal information."
          />
          <div className="grid gap-4 rounded-[32px] border border-card-border bg-background/70 p-5">
            <div>
              <p className="text-sm font-medium text-muted">Designed for the shop floor</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                Mobile-first, touch-friendly, and fast.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-foreground">
              <div className="rounded-2xl bg-card px-4 py-3">No sign-in</div>
              <div className="rounded-2xl bg-card px-4 py-3">Anonymous only</div>
              <div className="rounded-2xl bg-card px-4 py-3">Daily metrics</div>
              <div className="rounded-2xl bg-card px-4 py-3">CSV exports</div>
            </div>
            <Link
              href="/dashboard/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-card-border px-5 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent"
            >
              Open analytics dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Step 1"
            title="Select a store"
            description="Each response is tied to a store so the dashboard can compare branches and track trends over time."
          />
          <p className="text-sm text-muted">{stores.length} active stores ready for feedback</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>
    </div>
  );
}
