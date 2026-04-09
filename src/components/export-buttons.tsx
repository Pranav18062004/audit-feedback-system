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
        className="button-primary"
      >
        Export aggregate CSV
      </a>
      <a
        href={`/api/dashboard/export/feedback?${params.toString()}`}
        className="button-secondary"
      >
        Export raw feedback CSV
      </a>
    </div>
  );
}
