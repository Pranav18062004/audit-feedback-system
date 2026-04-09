"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type GoogleLoginButtonProps = {
  redirectTo: string;
  error?: string | null;
};

const errorMessages: Record<string, string> = {
  auth: "Google sign-in could not be completed. Please try again.",
};

export function GoogleLoginButton({ redirectTo, error }: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error ? (errorMessages[error] ?? "Unable to sign you in right now.") : null,
  );

  async function handleGoogleSignIn() {
    setLoading(true);
    setFormError(null);

    const supabase = getSupabaseBrowserClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("redirectTo", redirectTo);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (signInError) {
      setFormError(signInError.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {formError}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleGoogleSignIn()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-card-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        <span>{loading ? "Redirecting to Google..." : "Continue with Google"}</span>
      </button>

      <p className="text-center text-sm text-muted">
        Anyone with a Google account can submit feedback. Admin emails can also open the dashboard.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12.24 10.285v3.965h5.51c-.222 1.285-.956 2.37-2.066 3.09l3.34 2.59c1.945-1.79 3.066-4.425 3.066-7.555 0-.72-.065-1.415-.185-2.09z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.965-.895 6.62-2.42l-3.34-2.59c-.925.62-2.11.99-3.28.99-2.52 0-4.655-1.705-5.42-4l-3.455 2.665C5.77 19.97 8.64 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.58 13.98A5.996 5.996 0 0 1 6.28 12c0-.69.12-1.36.3-1.98L3.125 7.355A9.996 9.996 0 0 0 2 12c0 1.61.385 3.135 1.125 4.645z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.02c1.47 0 2.79.505 3.83 1.495l2.87-2.87C16.96 3.025 14.695 2 12 2 8.64 2 5.77 4.03 3.125 7.355L6.58 10.02c.765-2.295 2.9-4 5.42-4z"
      />
    </svg>
  );
}
