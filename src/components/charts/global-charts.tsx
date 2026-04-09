"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Question, StoreSummary } from "@/lib/supabase/types";
import { formatCount, formatRating } from "@/lib/utils";
type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;
const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: "8px",
  color: "var(--foreground)",
};
const tooltipLabelStyle = {
  color: "var(--foreground)",
  fontWeight: 600,
};
const tooltipItemStyle = {
  color: "var(--foreground)",
};

function toNumericTooltipValue(value: TooltipValue) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

type GlobalChartsProps = {
  questions: Question[];
  summaries: StoreSummary[];
};

export function GlobalCharts({ questions, summaries }: GlobalChartsProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(questions[0]?.id ?? "");

  const comparisonData = summaries.map((store) => ({
    id: store.storeId,
    name: store.storeName,
    overall: Number(store.overallAverage.toFixed(2)),
    feedbackCount: store.feedbackCount,
  }));

  const selectedQuestion = questions.find((question) => question.id === selectedQuestionId) ?? questions[0] ?? null;
  const questionData = useMemo(() => {
    if (!selectedQuestion) {
      return [];
    }

    return summaries
      .map((store) => ({
        id: store.storeId,
        name: store.storeName,
        score: Number((store.averages[selectedQuestion.id] ?? 0).toFixed(2)),
        feedbackCount: store.feedbackCount,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return b.feedbackCount - a.feedbackCount;
      });
  }, [selectedQuestion, summaries]);

  const questionStoresWithResponses = questionData.filter((store) => store.score > 0);
  const questionAverage =
    questionStoresWithResponses.length > 0
      ? questionStoresWithResponses.reduce((sum, store) => sum + store.score, 0) /
        questionStoresWithResponses.length
      : 0;
  const topQuestionStore = questionStoresWithResponses[0] ?? null;
  const lowestQuestionStore =
    questionStoresWithResponses.length > 0
      ? questionStoresWithResponses[questionStoresWithResponses.length - 1]
      : null;
  const comparisonChartHeight = Math.max(320, comparisonData.length * 44);
  const questionChartHeight = Math.max(320, questionData.length * 44);

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="chart-card p-5 xl:col-span-3">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Store comparison</h3>
          <p className="text-sm text-muted">Overall score by store for the selected date range.</p>
        </div>
        <div className="max-h-[560px] overflow-y-auto pr-2">
          <ResponsiveContainer width="100%" height={comparisonChartHeight}>
            <BarChart data={comparisonData} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatRating(toNumericTooltipValue(value))}
                labelFormatter={(value) => String(value)}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
              />
              <Bar dataKey="overall" name="Overall score" fill="#f5333f" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card p-5 xl:col-span-3">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Per-question analysis</h3>
          <p className="text-sm text-muted">
            Pick a question to compare stores on that specific rating.
          </p>
        </div>
        {questions.length > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {questions.map((question) => {
                const active = question.id === selectedQuestion?.id;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setSelectedQuestionId(question.id)}
                    className={
                      active
                        ? "button-primary"
                        : "button-secondary"
                    }
                  >
                    {question.title}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="subtle-panel p-4">
                <p className="text-sm text-muted">Question average</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatRating(questionAverage)}
                </p>
              </div>
              <div className="subtle-panel p-4">
                <p className="text-sm text-muted">Highest scoring store</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {topQuestionStore?.name ?? "N/A"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {topQuestionStore ? formatRating(topQuestionStore.score) : "No responses yet"}
                </p>
              </div>
              <div className="subtle-panel p-4">
                <p className="text-sm text-muted">Stores with responses</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCount(questionStoresWithResponses.length)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Lowest: {lowestQuestionStore ? `${lowestQuestionStore.name} (${formatRating(lowestQuestionStore.score)})` : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
              <div className="max-h-[560px] overflow-y-auto pr-2">
                <ResponsiveContainer width="100%" height={questionChartHeight}>
                  <BarChart data={questionData} layout="vertical" margin={{ left: 16, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                    <XAxis type="number" domain={[0, 10]} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={180}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => formatRating(toNumericTooltipValue(value))}
                      labelFormatter={(value) => String(value)}
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                    <Bar
                      dataKey="score"
                      name={selectedQuestion?.title ?? "Question"}
                      fill="#f5333f"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="max-h-[560px] overflow-auto pr-2">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="border-b border-card-border pb-3 pr-4 font-medium">Store</th>
                      <th className="border-b border-card-border pb-3 pr-4 font-medium">Score</th>
                      <th className="border-b border-card-border pb-3 font-medium">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionData.map((store) => (
                      <tr key={store.id} className="border-b border-card-border/80 last:border-b-0">
                        <td className="py-3 pr-4 font-medium text-foreground">{store.name}</td>
                        <td className="py-3 pr-4 text-foreground">{formatRating(store.score)}</td>
                        <td className="py-3 text-muted">{formatCount(store.feedbackCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-card-border px-4 py-6 text-sm text-muted">
            Add at least one active question to see per-question analysis.
          </div>
        )}
      </div>
    </div>
  );
}
