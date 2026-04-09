import { SectionHeading } from "@/components/section-heading";
import { StoreCard } from "@/components/store-card";
import { requireProfiledUser } from "@/lib/access";
import { getActiveStores } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireProfiledUser("/");
  const stores = await getActiveStores();

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="Stores"
            description="Choose the store before submitting feedback."
          />
          <p className="text-sm text-muted">{stores.length} active stores</p>
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
