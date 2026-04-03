"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function PasscodeForm() {
  const params = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const redirectTo = params.get("redirectTo") ?? "/dashboard";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/dashboard/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passcode, redirectTo }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to unlock dashboard.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { redirectTo: string };
    window.location.href = payload.redirectTo;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="passcode" className="text-sm font-semibold text-foreground">
          Shared dashboard passcode
        </label>
        <input
          id="passcode"
          type="password"
          autoComplete="current-password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          className="w-full rounded-full border border-card-border bg-background/70 px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none"
          placeholder="Enter passcode"
        />
      </div>
      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Unlocking..." : "Unlock dashboard"}
      </button>
    </form>
  );
}
