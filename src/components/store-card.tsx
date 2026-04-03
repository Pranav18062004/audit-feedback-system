import Link from "next/link";
import type { Store } from "@/lib/supabase/types";

type StoreCardProps = {
  store: Store;
};

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/feedback/${store.id}`}
      className="group relative overflow-hidden rounded-[28px] border border-card-border bg-card p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:border-accent/60"
    >
      <div className="absolute inset-0 swirl-bg opacity-70" />
      <div className="relative z-10 flex min-h-44 flex-col justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{store.code}</p>
          <h3 className="text-xl font-semibold text-foreground">{store.name}</h3>
          <p className="text-sm text-muted">
            {store.region ? `${store.region} region` : "Regional assignment pending"}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm font-medium text-foreground">
          <span>Give feedback</span>
          <span className="rounded-full bg-accent px-3 py-1 text-white">Open</span>
        </div>
      </div>
    </Link>
  );
}
