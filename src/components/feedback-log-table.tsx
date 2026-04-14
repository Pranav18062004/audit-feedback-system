import type { Question, RawFeedbackRow } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";

type FeedbackLogTableProps = {
  title: string;
  description: string;
  questions: Question[];
  rows: RawFeedbackRow[];
  showStore?: boolean;
};

export function FeedbackLogTable({
  title,
  description,
  questions,
  rows,
  showStore = false,
}: FeedbackLogTableProps) {
  return (
    <section className="panel p-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-card-border px-4 py-6 text-sm text-muted">
          No submissions were captured in this date range.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="border-b border-card-border pb-3 pr-4 font-medium">Submitted by</th>
                {showStore ? (
                  <th className="border-b border-card-border pb-3 pr-4 font-medium">Store</th>
                ) : null}
                <th className="border-b border-card-border pb-3 pr-4 font-medium">Submitted</th>
                <th className="border-b border-card-border pb-3 pr-4 font-medium">Ratings</th>
                <th className="border-b border-card-border pb-3 font-medium">Comments</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const ratingsByQuestion = new Map(
                  (row.feedback_ratings ?? [])
                    .filter((rating) => rating.questions?.id)
                    .map((rating) => [rating.questions!.id, rating.rating]),
                );

                return (
                  <tr key={row.id} className="align-top border-b border-card-border/80 last:border-b-0">
                    <td className="py-4 pr-4">
                      <div className="font-medium text-foreground">{row.submitted_by_name}</div>
                      <div className="text-muted">{row.submitted_by_email}</div>
                    </td>
                    {showStore ? (
                      <td className="py-4 pr-4">
                        <div className="font-medium text-foreground">{row.stores?.name ?? "Unknown store"}</div>
                        <div className="text-muted">{row.stores?.code ?? row.store_id}</div>
                      </td>
                    ) : null}
                    <td className="py-4 pr-4 text-muted">{formatDate(row.created_at)}</td>
                    <td className="py-4 pr-4">
                      <div className="flex min-w-56 flex-wrap gap-2">
                        {questions.map((question) => {
                          const value = ratingsByQuestion.get(question.id);
                          return (
                            <span
                              key={question.id}
                              className="rounded-full border border-card-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
                            >
                              {question.title}: {typeof value === "number" ? value : "N/A"}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 text-muted">
                      {row.comments ? (
                        <p className="max-w-md whitespace-pre-wrap text-sm text-foreground">
                          {row.comments}
                        </p>
                      ) : (
                        <span className="text-muted">No comment</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
