import Link from "next/link";
import { LazyGlobalCharts } from "@/components/charts/lazy-global-charts";
import { DateRangeFilter } from "@/components/date-range-filter";
import { ExportButtons } from "@/components/export-buttons";
import { StatCard } from "@/components/stat-card";
import { defaultDatePreset } from "@/config/feedback";
import { getGlobalAnalytics } from "@/lib/queries";
import { formatCount, formatRating, getDateRangeFromPreset } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const preset = typeof params.preset === "string" ? params.preset : defaultDatePreset;
  const derivedRange = getDateRangeFromPreset(preset);
  const startDate =
    typeof params.startDate === "string"
      ? params.startDate
      : derivedRange?.startDate ?? getDateRangeFromPreset(defaultDatePreset)!.startDate;
  const endDate =
    typeof params.endDate === "string"
      ? params.endDate
      : derivedRange?.endDate ?? getDateRangeFromPreset(defaultDatePreset)!.endDate;

  const analytics = await getGlobalAnalytics({ startDate, endDate });

  return (
    <div className="space-y-6 pb-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <DateRangeFilter startDate={startDate} endDate={endDate} preset={preset} />
        <div className="glass-panel rounded-[28px] p-4">
          <p className="text-sm font-medium text-muted">Exports</p>
          <div className="mt-3">
            <ExportButtons startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total feedback"
          value={formatCount(analytics.totalFeedbackCount)}
          hint="Anonymous submissions in range"
        />
        <StatCard
          label="Overall average"
          value={formatRating(analytics.overallAverage)}
          hint="Weighted across all stores"
        />
        <StatCard
          label="Best store"
          value={analytics.bestStore?.storeCode ?? "N/A"}
          hint={
            analytics.bestStore
              ? `${formatRating(analytics.bestStore.overallAverage)} overall`
              : "No feedback yet"
          }
        />
        <StatCard
          label="Comments captured"
          value={formatCount(analytics.totalCommentsCount)}
          hint="Optional comment count"
        />
      </div>

      <LazyGlobalCharts
        questions={analytics.questions}
        summaries={analytics.summaries}
        trends={analytics.trends}
      />

      <section className="rounded-[32px] border border-card-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Store ranking</h3>
            <p className="text-sm text-muted">
              Compare stores by weighted overall score and feedback volume.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 pr-4 font-medium">Rank</th>
                <th className="pb-3 pr-4 font-medium">Store</th>
                <th className="pb-3 pr-4 font-medium">Overall</th>
                <th className="pb-3 pr-4 font-medium">Feedback</th>
                <th className="pb-3 pr-4 font-medium">Region</th>
                <th className="pb-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {analytics.summaries.map((store, index) => (
                <tr key={store.storeId} className="border-t border-card-border/80">
                  <td className="py-4 pr-4 font-semibold text-foreground">#{index + 1}</td>
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-semibold text-foreground">{store.storeName}</p>
                      <p className="text-muted">{store.storeCode}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-foreground">
                    {formatRating(store.overallAverage)}
                  </td>
                  <td className="py-4 pr-4 text-foreground">
                    {formatCount(store.feedbackCount)}
                  </td>
                  <td className="py-4 pr-4 text-muted">{store.region ?? "N/A"}</td>
                  <td className="py-4">
                    <Link
                      href={`/dashboard/stores/${store.storeId}?startDate=${startDate}&endDate=${endDate}&preset=${preset}`}
                      className="font-semibold text-accent hover:text-accent-strong"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
