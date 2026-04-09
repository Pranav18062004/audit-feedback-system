"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Question, StoreSummary } from "@/lib/supabase/types";
import { formatRating, formatShortDate } from "@/lib/utils";

const pieColors = ["#f5333f", "#b3b5b8", "#8e9094", "#d4d7db", "#232528"];
type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;

function toNumericTooltipValue(value: TooltipValue) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

type GlobalChartsProps = {
  questions: Question[];
  summaries: StoreSummary[];
  trends: Array<{ date: string; feedbackCount: number; overall: number; averages: Record<string, number> }>;
};

export function GlobalCharts({ questions, summaries, trends }: GlobalChartsProps) {
  const comparisonQuestion = questions[0];
  const comparisonData = summaries.map((store) => ({
    name: store.storeCode,
    overall: Number(store.overallAverage.toFixed(2)),
    comparisonQuestion: comparisonQuestion
      ? Number((store.averages[comparisonQuestion.id] ?? 0).toFixed(2))
      : 0,
  }));

  const pieData = summaries.map((store) => ({
    name: store.storeCode,
    value: store.feedbackCount,
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="chart-card p-5 xl:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Store comparison</h3>
          <p className="text-sm text-muted">
            Overall score and {comparisonQuestion?.title.toLowerCase() ?? "lead question"} by store.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip formatter={(value) => formatRating(toNumericTooltipValue(value))} />
            <Legend />
            <Bar dataKey="overall" name="Overall" fill="#f5333f" radius={[8, 8, 0, 0]} />
            {comparisonQuestion ? (
              <Bar
                dataKey="comparisonQuestion"
                name={comparisonQuestion.title}
                fill="#8e9094"
                radius={[8, 8, 0, 0]}
              />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Feedback share</h3>
          <p className="text-sm text-muted">Contribution to total feedback volume.</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={3}>
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card p-5 xl:col-span-3">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Trend over time</h3>
          <p className="text-sm text-muted">Daily feedback volume and overall average.</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trends.map((item) => ({ ...item, label: formatShortDate(item.date) }))}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="label" />
            <YAxis yAxisId="left" domain={[0, 10]} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, key) =>
                key === "overall" ? formatRating(toNumericTooltipValue(value)) : toNumericTooltipValue(value)
              }
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="overall" name="Overall" stroke="#f5333f" strokeWidth={3} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="feedbackCount" name="Feedback count" stroke="#8e9094" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
