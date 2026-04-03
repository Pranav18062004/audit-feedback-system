type ExportButtonsProps = {
  startDate: string;
  endDate: string;
  storeId?: string;
};

export function ExportButtons({ startDate, endDate, storeId }: ExportButtonsProps) {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  if (storeId) {
    params.set("storeId", storeId);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={`/api/dashboard/export/aggregates?${params.toString()}`}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong"
      >
        Export aggregate CSV
      </a>
      <a
        href={`/api/dashboard/export/feedback?${params.toString()}`}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-card-border px-4 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent"
      >
        Export raw feedback CSV
      </a>
    </div>
  );
}
