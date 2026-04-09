import {
  type AllowedUser,
  type Question,
  type RawFeedbackRow,
  type Store,
  type StoreMetricRow,
  type StoreSummary,
  type TrendPoint,
} from "@/lib/supabase/types";
import {
  getSupabaseServerClient,
  getSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

type RangeInput = {
  startDate: string;
  endDate: string;
};

function normalizeMetricJson(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, number>;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, Number(entry ?? 0)]),
  );
}

function buildAverageMap(
  sums: Record<string, number>,
  counts: Record<string, number>,
  questions: Question[],
) {
  const averages: Record<string, number> = {};

  for (const question of questions) {
    const count = counts[question.id] ?? 0;
    const sum = sums[question.id] ?? 0;
    averages[question.id] = count > 0 ? sum / count : 0;
  }

  return averages;
}

function calculateOverallAverage(averages: Record<string, number>, questions: Question[]) {
  let sum = 0;
  let count = 0;

  for (const question of questions) {
    const value = averages[question.id];
    if (typeof value === "number" && value > 0) {
      sum += value;
      count += 1;
    }
  }

  return count > 0 ? sum / count : 0;
}

export async function getActiveStores() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, code, region, is_active, created_at")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  return (data ?? []) as Store[];
}

export async function getAllStoresForDashboard() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, code, region, is_active, created_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  return (data ?? []) as Store[];
}

export async function getStoreById(storeId: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, code, region, is_active, created_at")
    .eq("id", storeId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load store: ${error.message}`);
  }

  return (data as Store | null) ?? null;
}

export async function getActiveQuestions() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, slug, title, description, sort_order, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }

  return (data ?? []) as Question[];
}

export async function getAllQuestionsForDashboard() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, slug, title, description, sort_order, is_active, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }

  return (data ?? []) as Question[];
}

async function getMetricsRows(range: RangeInput, storeId?: string) {
  const supabase = getSupabaseServiceRoleClient();
  let query = supabase
    .from("store_metrics")
    .select("store_id, metric_date, feedback_count, comments_count, rating_sums, rating_counts")
    .gte("metric_date", range.startDate)
    .lte("metric_date", range.endDate)
    .order("metric_date", { ascending: true });

  if (storeId) {
    query = query.eq("store_id", storeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load metrics: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    ...row,
    rating_sums: normalizeMetricJson(row.rating_sums),
    rating_counts: normalizeMetricJson(row.rating_counts),
  })) as StoreMetricRow[];
}

export async function getGlobalAnalytics(range: RangeInput) {
  const [stores, questions, metricsRows] = await Promise.all([
    getActiveStores(),
    getActiveQuestions(),
    getMetricsRows(range),
  ]);

  const byStore = new Map<string, StoreSummary>();
  const aggregatedByStore = new Map<
    string,
    { sums: Record<string, number>; counts: Record<string, number> }
  >();
  const trendMap = new Map<
    string,
    {
      date: string;
      feedbackCount: number;
      sums: Record<string, number>;
      counts: Record<string, number>;
    }
  >();

  for (const store of stores) {
    byStore.set(store.id, {
      storeId: store.id,
      storeName: store.name,
      storeCode: store.code,
      region: store.region,
      feedbackCount: 0,
      commentsCount: 0,
      overallAverage: 0,
      averages: {},
    });
  }

  for (const row of metricsRows) {
    const summary = byStore.get(row.store_id);
    if (!summary) {
      continue;
    }

    summary.feedbackCount += row.feedback_count;
    summary.commentsCount += row.comments_count;

    const aggregate = aggregatedByStore.get(row.store_id) ?? { sums: {}, counts: {} };
    for (const question of questions) {
      aggregate.sums[question.id] =
        (aggregate.sums[question.id] ?? 0) + (row.rating_sums[question.id] ?? 0);
      aggregate.counts[question.id] =
        (aggregate.counts[question.id] ?? 0) + (row.rating_counts[question.id] ?? 0);
    }
    aggregatedByStore.set(row.store_id, aggregate);

    const trendEntry = trendMap.get(row.metric_date) ?? {
      date: row.metric_date,
      feedbackCount: 0,
      sums: {},
      counts: {},
    };
    trendEntry.feedbackCount += row.feedback_count;
    for (const question of questions) {
      trendEntry.sums[question.id] =
        (trendEntry.sums[question.id] ?? 0) + (row.rating_sums[question.id] ?? 0);
      trendEntry.counts[question.id] =
        (trendEntry.counts[question.id] ?? 0) + (row.rating_counts[question.id] ?? 0);
    }
    trendMap.set(row.metric_date, trendEntry);
  }

  const summaries = Array.from(byStore.values())
    .map((summary) => {
      const aggregate = aggregatedByStore.get(summary.storeId) ?? { sums: {}, counts: {} };
      summary.averages = buildAverageMap(aggregate.sums, aggregate.counts, questions);
      summary.overallAverage = calculateOverallAverage(summary.averages, questions);
      return summary;
    })
    .sort((a, b) => {
      if (b.overallAverage !== a.overallAverage) {
        return b.overallAverage - a.overallAverage;
      }
      return b.feedbackCount - a.feedbackCount;
    });

  const totalFeedbackCount = summaries.reduce((total, store) => total + store.feedbackCount, 0);
  const totalCommentsCount = summaries.reduce((total, store) => total + store.commentsCount, 0);
  const globalSums: Record<string, number> = {};
  const globalCounts: Record<string, number> = {};

  for (const row of metricsRows) {
    for (const question of questions) {
      globalSums[question.id] = (globalSums[question.id] ?? 0) + (row.rating_sums[question.id] ?? 0);
      globalCounts[question.id] =
        (globalCounts[question.id] ?? 0) + (row.rating_counts[question.id] ?? 0);
    }
  }

  const overallAverage = calculateOverallAverage(
    buildAverageMap(globalSums, globalCounts, questions),
    questions,
  );

  return {
    questions,
    summaries,
    totalFeedbackCount,
    totalCommentsCount,
    overallAverage,
    bestStore: summaries[0] ?? null,
    worstStore: summaries[summaries.length - 1] ?? null,
    trends: Array.from(trendMap.values()).map((entry) => {
      const averages = buildAverageMap(entry.sums, entry.counts, questions);
      return {
        date: entry.date,
        feedbackCount: entry.feedbackCount,
        overall: calculateOverallAverage(averages, questions),
        averages,
      };
    }),
  };
}

export async function getStoreAnalytics(storeId: string, range: RangeInput) {
  const [store, questions, metricsRows] = await Promise.all([
    getStoreById(storeId),
    getActiveQuestions(),
    getMetricsRows(range, storeId),
  ]);

  if (!store) {
    return null;
  }

  let feedbackCount = 0;
  let commentsCount = 0;
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  const trends: TrendPoint[] = metricsRows.map((row) => {
    feedbackCount += row.feedback_count;
    commentsCount += row.comments_count;

    for (const question of questions) {
      sums[question.id] = (sums[question.id] ?? 0) + (row.rating_sums[question.id] ?? 0);
      counts[question.id] = (counts[question.id] ?? 0) + (row.rating_counts[question.id] ?? 0);
    }

    const averages = buildAverageMap(row.rating_sums, row.rating_counts, questions);
    return {
      date: row.metric_date,
      feedbackCount: row.feedback_count,
      overall: calculateOverallAverage(averages, questions),
      averages,
    };
  });

  const averages = buildAverageMap(sums, counts, questions);

  return {
    store,
    questions,
    feedbackCount,
    commentsCount,
    overallAverage: calculateOverallAverage(averages, questions),
    averages,
    trends,
  };
}

export async function getFeedbackExportRows(
  range: RangeInput,
  storeId?: string,
  limit?: number,
) {
  const supabase = getSupabaseServiceRoleClient();
  let query = supabase
    .from("feedback")
    .select(
      "id, store_id, created_at, comments, submitted_by_email, stores(name, code), feedback_ratings(rating, questions(id, slug, title))",
    )
    .gte("created_at", `${range.startDate}T00:00:00.000Z`)
    .lte("created_at", `${range.endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: false });

  if (storeId) {
    query = query.eq("store_id", storeId);
  }

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load feedback export rows: ${error.message}`);
  }

  return (data ?? []) as unknown as RawFeedbackRow[];
}

export async function getRecentFeedbackRows(range: RangeInput, storeId?: string, limit = 25) {
  return getFeedbackExportRows(range, storeId, limit);
}

export async function getAllowedUsersForDashboard() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("allowed_users")
    .select("id, email, role, is_active, created_at, updated_at")
    .order("email", { ascending: true });

  if (error) {
    throw new Error(`Failed to load allowed users: ${error.message}`);
  }

  return (data ?? []) as AllowedUser[];
}

export async function getAggregateExportRows(range: RangeInput, storeId?: string) {
  const [stores, questions, metricsRows] = await Promise.all([
    getActiveStores(),
    getActiveQuestions(),
    getMetricsRows(range, storeId),
  ]);
  const storesById = new Map(stores.map((store) => [store.id, store]));

  return metricsRows.map((row) => {
    const store = storesById.get(row.store_id);
    const averages = buildAverageMap(row.rating_sums, row.rating_counts, questions);
    const base: Record<string, string | number> = {
      metric_date: row.metric_date,
      store_id: row.store_id,
      store_name: store?.name ?? "Unknown store",
      store_code: store?.code ?? "N/A",
      region: store?.region ?? "",
      feedback_count: row.feedback_count,
      comments_count: row.comments_count,
      overall_average: Number(calculateOverallAverage(averages, questions).toFixed(2)),
    };

    for (const question of questions) {
      base[`avg_${question.slug}`] = Number((averages[question.id] ?? 0).toFixed(2));
      base[`count_${question.slug}`] = row.rating_counts[question.id] ?? 0;
    }

    return base;
  });
}
