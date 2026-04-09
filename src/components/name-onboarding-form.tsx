"use client";

import { useState } from "react";

type NameOnboardingFormProps = {
  email: string;
  redirectTo: string;
};

export function NameOnboardingForm({ email, redirectTo }: NameOnboardingFormProps) {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        redirectTo,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to save your name.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { redirectTo: string };
    window.location.href = payload.redirectTo;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Signed-in email
        </label>
        <input id="email" value={email} readOnly className="field-input bg-surface text-muted" />
      </div>

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
          Display name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="field-input"
          placeholder="Enter your name"
          minLength={2}
          maxLength={100}
          required
        />
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
