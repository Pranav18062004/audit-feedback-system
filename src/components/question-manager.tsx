"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Question } from "@/lib/supabase/types";

type QuestionManagerProps = {
  questions: Question[];
};

type FormState = {
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export function QuestionManager({ questions }: QuestionManagerProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function createQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreating(true);
    setCreateError(null);

    const formData = new FormData(form);
    const response = await fetch("/api/dashboard/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        sort_order: Number(formData.get("sort_order") ?? 0),
        is_active: formData.get("is_active") === "on",
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setCreateError(payload?.message ?? "Unable to create question.");
      setCreating(false);
      return;
    }

    form.reset();
    setCreating(false);
    router.refresh();
  }

  async function updateQuestion(id: string, state: FormState) {
    setEditingId(id);
    setEditError(null);

    const response = await fetch("/api/dashboard/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...state,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setEditError(payload?.message ?? "Unable to update question.");
      setEditingId(null);
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-card-border bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Add a question</h3>
        <p className="mt-1 text-sm text-muted">
          Questions are always 1-10 ratings. The optional comments box stays unchanged.
        </p>
        <form onSubmit={createQuestion} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Title</span>
            <input
              name="title"
              required
              className="w-full rounded-full border border-card-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
              placeholder="Example: Staff knowledge"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Sort order</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={questions.length + 1}
              className="w-full rounded-full border border-card-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground lg:col-span-2">
            <span>Description</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-3xl border border-card-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
              placeholder="Optional helper text for the public form."
            />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
            <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4 rounded border-card-border" />
            Active on the public form
          </label>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
          >
            {creating ? "Saving..." : "Create question"}
          </button>
        </form>
        {createError ? <p className="mt-3 text-sm font-medium text-red-600">{createError}</p> : null}
      </section>

      <section className="rounded-[32px] border border-card-border bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Existing questions</h3>
        <p className="mt-1 text-sm text-muted">
          Edit wording, order, or active status. Inactive questions stop appearing on the public form.
        </p>
        <div className="mt-5 space-y-4">
          {questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              isSaving={editingId === question.id}
              onSave={updateQuestion}
            />
          ))}
        </div>
        {editError ? <p className="mt-3 text-sm font-medium text-red-600">{editError}</p> : null}
      </section>
    </div>
  );
}

function QuestionEditor({
  question,
  isSaving,
  onSave,
}: {
  question: Question;
  isSaving: boolean;
  onSave: (id: string, state: FormState) => Promise<void>;
}) {
  const [state, setState] = useState<FormState>({
    title: question.title,
    description: question.description ?? "",
    sort_order: question.sort_order,
    is_active: question.is_active,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(question.id, state);
      }}
      className="grid gap-4 rounded-[28px] border border-card-border bg-background/70 p-4 lg:grid-cols-[1fr_140px]"
    >
      <div className="grid gap-4">
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Title</span>
          <input
            value={state.title}
            onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))}
            required
            className="w-full rounded-full border border-card-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Description</span>
          <textarea
            rows={2}
            value={state.description}
            onChange={(event) =>
              setState((current) => ({ ...current, description: event.target.value }))
            }
            className="w-full rounded-3xl border border-card-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
      </div>
      <div className="grid gap-4">
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Order</span>
          <input
            type="number"
            value={state.sort_order}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                sort_order: Number(event.target.value),
              }))
            }
            className="w-full rounded-full border border-card-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
        <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={state.is_active}
            onChange={(event) =>
              setState((current) => ({ ...current, is_active: event.target.checked }))
            }
            className="h-4 w-4 rounded border-card-border"
          />
          Active
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
