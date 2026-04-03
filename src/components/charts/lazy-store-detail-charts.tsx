"use client";

import dynamic from "next/dynamic";
import type { Question, TrendPoint } from "@/lib/supabase/types";

const StoreDetailCharts = dynamic(
  () => import("@/components/charts/store-detail-charts").then((mod) => mod.StoreDetailCharts),
  { ssr: false },
);

type LazyStoreDetailChartsProps = {
  questions: Question[];
  trends: TrendPoint[];
};

export function LazyStoreDetailCharts(props: LazyStoreDetailChartsProps) {
  return <StoreDetailCharts {...props} />;
}
