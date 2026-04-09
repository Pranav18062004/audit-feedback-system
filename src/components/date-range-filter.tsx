"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultDatePreset } from "@/config/feedback";
import { cn, getDateRangeFromPreset } from "@/lib/utils";

const presets = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "custom", label: "Custom" },
] as const;

type DateRangeFilterProps = {
  startDate: string;
  endDate: string;
  preset: string;
};

export function DateRangeFilter({ startDate, endDate, preset }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pushParams(next: URLSearchParams) {
    router.push(`${pathname}?${next.toString()}`);
  }

  function handlePresetChange(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("preset", value);
    const range = getDateRangeFromPreset(value);

    if (range) {
      next.set("startDate", range.startDate);
      next.set("endDate", range.endDate);
    }

    if (!value) {
      next.set("preset", defaultDatePreset);
    }

    pushParams(next);
  }

  function handleCustomChange(key: "startDate" | "endDate", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("preset", "custom");
    next.set(key, value);
    pushParams(next);
  }

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handlePresetChange(item.value)}
            className={cn(
              "inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-medium",
              preset === item.value
                ? "bg-accent text-white"
                : "border border-card-border bg-card text-foreground hover:border-accent hover:text-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => handleCustomChange("startDate", event.target.value)}
            className="field-input"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => handleCustomChange("endDate", event.target.value)}
            className="field-input"
          />
        </label>
      </div>
    </div>
  );
}
