"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FeedbackRatingGroup } from "@/components/feedback-rating-group";
import type { Question } from "@/lib/supabase/types";

type FeedbackFormProps = {
  storeId: string;
  storeName: string;
  questions: Question[];
};

export function FeedbackForm({ storeId, storeName, questions }: FeedbackFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [comments, setComments] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const missingQuestionIds = useMemo(
    () => questions.filter((question) => !ratings[question.id]).map((question) => question.id),
    [questions, ratings],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (missingQuestionIds.length > 0) {
      setErrorMessage("Please answer every rating question before submitting.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId,
        comments,
        ratings: questions.map((question) => ({
          questionId: question.id,
          rating: ratings[question.id],
        })),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setErrorMessage(payload?.message ?? "Unable to submit feedback.");
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setComments("");
    setRatings({});
    setIsSubmitting(false);
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
          Feedback received
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">Thank you for your input.</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
          Your anonymous feedback for {storeName} has been recorded. No personal data was
          collected.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Submit another response
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-card-border px-5 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent"
          >
            Choose another store
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {questions.map((question) => (
        <FeedbackRatingGroup
          key={question.id}
          name={question.slug}
          label={question.title}
          description={question.description ?? "Rate this item from 1 to 10."}
          value={ratings[question.id]}
          onChange={(value) =>
            setRatings((current) => ({
              ...current,
              [question.id]: value,
            }))
          }
          error={
            errorMessage && missingQuestionIds.includes(question.id)
              ? "Please choose a rating."
              : undefined
          }
        />
      ))}

      <div className="rounded-[28px] border border-card-border bg-card p-5">
        <label htmlFor="comments" className="block text-base font-semibold text-foreground">
          Optional comments
        </label>
        <p className="mt-1 text-sm text-muted">
          Keep it short. Comments are anonymous and limited to 500 characters.
        </p>
        <textarea
          id="comments"
          rows={4}
          maxLength={500}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Share anything that would help improve the store experience."
          className="mt-4 w-full rounded-3xl border border-card-border bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-accent px-6 text-base font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}
