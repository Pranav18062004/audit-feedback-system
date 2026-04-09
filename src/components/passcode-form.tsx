"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function PasscodeForm() {
  const params = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
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
        <div className="relative">
          <input
            id="passcode"
            type={showPasscode ? "text" : "password"}
            autoComplete="current-password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            className="field-input pr-12"
            placeholder="Enter passcode"
          />
          <button
            type="button"
            onClick={() => setShowPasscode((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-foreground"
            aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
          >
            {showPasscode ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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
        {loading ? "Unlocking..." : "Unlock dashboard"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
    >
      <path
        d="M1.25 10s3.25-5 8.75-5 8.75 5 8.75 5-3.25 5-8.75 5-8.75-5-8.75-5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
    >
      <path
        d="M2 2.5 18 17.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 4.15A10.85 10.85 0 0 1 10 4.08c5.5 0 8.75 5 8.75 5a15.66 15.66 0 0 1-2.93 3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 6.05A15.2 15.2 0 0 0 1.25 10s3.25 5 8.75 5c1.05 0 2-.18 2.87-.48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.53 8.6A2.48 2.48 0 0 0 7.5 10c0 1.38 1.12 2.5 2.5 2.5.52 0 1-.16 1.4-.43"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
