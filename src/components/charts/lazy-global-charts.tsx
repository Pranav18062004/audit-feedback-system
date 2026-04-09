"use client";

import dynamic from "next/dynamic";
import type { Question, StoreSummary } from "@/lib/supabase/types";

const GlobalCharts = dynamic(
  () => import("@/components/charts/global-charts").then((mod) => mod.GlobalCharts),
  { ssr: false },
);

type LazyGlobalChartsProps = {
  questions: Question[];
  summaries: StoreSummary[];
};

export function LazyGlobalCharts(props: LazyGlobalChartsProps) {
  return <GlobalCharts {...props} />;
}
