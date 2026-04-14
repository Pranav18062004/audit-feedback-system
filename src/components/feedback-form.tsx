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
  const [ratings, setRatings] = useState<Record<string, number | null>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const missingQuestionIds = useMemo(
    () =>
      questions
        .filter((question) => !(question.id in ratings))
        .map((question) => question.id),
    [questions, ratings],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (missingQuestionIds.length > 0) {
      setErrorMessage("Please choose a score or N/A for every question before submitting.");
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
      <div className="panel p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Feedback submitted</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Your feedback for {storeName} has been recorded with your signed-in name and email.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="button-primary"
          >
            Submit another response
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="button-secondary"
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
          description={question.description ?? "Rate this item from 1 to 10, or choose N/A."}
          value={ratings[question.id]}
          onChange={(value) =>
            setRatings((current) => ({
              ...current,
              [question.id]: value,
            }))
          }
          error={
            errorMessage && missingQuestionIds.includes(question.id)
              ? "Please choose a rating or N/A."
              : undefined
          }
        />
      ))}

      <div className="panel p-5">
        <label htmlFor="comments" className="block text-base font-semibold text-foreground">
          Optional comments
        </label>
        <p className="mt-1 text-sm text-muted">
          Keep it short. Comments are tied to your signed-in name and email and limited to 500 characters.
        </p>
        <textarea
          id="comments"
          rows={4}
          maxLength={500}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Share anything that would help improve the store experience."
          className="field-input mt-4 min-h-28 resize-y placeholder:text-muted"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}
