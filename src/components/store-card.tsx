import Link from "next/link";
import type { Store } from "@/lib/supabase/types";

type StoreCardProps = {
  store: Store;
};

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/feedback/${store.id}`}
      className="panel flex min-h-32 flex-col justify-between p-5 hover:border-accent"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{store.name}</h3>
        <p className="text-sm text-muted">{store.code}</p>
        <p className="text-sm text-muted">{store.region ?? "No region assigned"}</p>
      </div>
      <div className="mt-4 text-sm font-medium text-accent">Open feedback form</div>
    </Link>
  );
}
