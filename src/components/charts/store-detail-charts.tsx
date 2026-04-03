"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Question, TrendPoint } from "@/lib/supabase/types";
import { formatRating, formatShortDate } from "@/lib/utils";

type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;

function toNumericTooltipValue(value: TooltipValue) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

const lineColors = ["#c96838", "#4e8d75", "#6d6257", "#d98f5f", "#8d5fd9", "#5f9dd9"];

type StoreDetailChartsProps = {
  questions: Question[];
  trends: TrendPoint[];
};

export function StoreDetailCharts({ questions, trends }: StoreDetailChartsProps) {
  const data = trends.map((item) => ({
    ...item,
    label: formatShortDate(item.date),
    ...Object.fromEntries(questions.map((question) => [question.slug, item.averages[question.id] ?? 0])),
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="chart-card rounded-[28px] border border-card-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Question trend</h3>
          <p className="text-sm text-muted">Daily score movement for active rating questions.</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 10]} />
            <Tooltip formatter={(value) => formatRating(toNumericTooltipValue(value))} />
            <Legend />
            <Line type="monotone" dataKey="overall" name="Overall" stroke="#c96838" strokeWidth={3} dot={false} />
            {questions.map((question, index) => (
              <Line
                key={question.id}
                type="monotone"
                dataKey={question.slug}
                name={question.title}
                stroke={lineColors[index % lineColors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card rounded-[28px] border border-card-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Feedback volume</h3>
          <p className="text-sm text-muted">Daily submission count for this store.</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="feedbackCount" stroke="#4e8d75" fill="#4e8d75" fillOpacity={0.25} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
