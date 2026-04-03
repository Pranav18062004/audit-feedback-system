import Link from "next/link";
import { notFound } from "next/navigation";
import { LazyStoreDetailCharts } from "@/components/charts/lazy-store-detail-charts";
import { DateRangeFilter } from "@/components/date-range-filter";
import { ExportButtons } from "@/components/export-buttons";
import { StatCard } from "@/components/stat-card";
import { defaultDatePreset } from "@/config/feedback";
import { getStoreAnalytics } from "@/lib/queries";
import { formatCount, formatRating, getDateRangeFromPreset } from "@/lib/utils";

type StoreDashboardPageProps = {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function StoreDashboardPage({
  params,
  searchParams,
}: StoreDashboardPageProps) {
  const { storeId } = await params;
  const filters = await searchParams;
  const preset = typeof filters.preset === "string" ? filters.preset : defaultDatePreset;
  const derivedRange = getDateRangeFromPreset(preset);
  const startDate =
    typeof filters.startDate === "string"
      ? filters.startDate
      : derivedRange?.startDate ?? getDateRangeFromPreset(defaultDatePreset)!.startDate;
  const endDate =
    typeof filters.endDate === "string"
      ? filters.endDate
      : derivedRange?.endDate ?? getDateRangeFromPreset(defaultDatePreset)!.endDate;

  const analytics = await getStoreAnalytics(storeId, { startDate, endDate });

  if (!analytics) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/dashboard?startDate=${startDate}&endDate=${endDate}&preset=${preset}`}
            className="text-sm font-semibold text-accent hover:text-accent-strong"
          >
            Back to global analytics
          </Link>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {analytics.store.name}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {analytics.store.code}
            {analytics.store.region ? ` | ${analytics.store.region}` : ""}
          </p>
        </div>
        <ExportButtons startDate={startDate} endDate={endDate} storeId={analytics.store.id} />
      </div>

      <DateRangeFilter startDate={startDate} endDate={endDate} preset={preset} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Feedback count"
          value={formatCount(analytics.feedbackCount)}
          hint="Responses in selected range"
        />
        <StatCard
          label="Overall score"
          value={formatRating(analytics.overallAverage)}
          hint="Weighted average"
        />
        <StatCard
          label={analytics.questions[0]?.title ?? "Lead score"}
          value={formatRating(analytics.averages[analytics.questions[0]?.id ?? ""] ?? 0)}
          hint="First active question"
        />
        <StatCard
          label="Comment count"
          value={formatCount(analytics.commentsCount)}
          hint="Optional text feedback"
        />
      </div>

      <LazyStoreDetailCharts questions={analytics.questions} trends={analytics.trends} />

      <section className="rounded-[32px] border border-card-border bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Question summary</h3>
        <p className="mt-1 text-sm text-muted">Weighted averages from daily precomputed metrics.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-card-border bg-background/70 p-4">
            <p className="text-sm text-muted">Overall</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatRating(analytics.overallAverage)}
            </p>
          </div>
          {analytics.questions.map((question) => (
            <div
              key={question.id}
              className="rounded-[24px] border border-card-border bg-background/70 p-4"
            >
              <p className="text-sm text-muted">{question.title}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatRating(analytics.averages[question.id] ?? 0)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
