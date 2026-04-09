import { StoreManager } from "@/components/store-manager";
import { getAllStoresForDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardStoresPage() {
  const stores = await getAllStoresForDashboard();

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-2 border-b border-card-border pb-4">
        <h2 className="text-2xl font-semibold text-foreground">Manage stores</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Create stores, update names and codes, and control which stores are available in the
          feedback form.
        </p>
      </section>

      <StoreManager stores={stores} />
    </div>
  );
}
