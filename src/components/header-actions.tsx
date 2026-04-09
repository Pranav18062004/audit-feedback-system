"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

type HeaderActionsProps = {
  isSignedIn: boolean;
  isAdmin: boolean;
  email: string | null;
};

export function HeaderActions({ isSignedIn, isAdmin, email }: HeaderActionsProps) {
  const pathname = usePathname();
  const inDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const actionClass =
    "button-secondary min-w-0 px-3 text-center text-sm sm:px-4";

  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
      {inDashboard ? (
        <>
          <Link href="/" className={actionClass}>
            Home
          </Link>
          <form action="/api/dashboard/logout" method="post">
            <button type="submit" className={actionClass}>
              Lock
            </button>
          </form>
          <form action="/auth/logout" method="post">
            <button type="submit" className={actionClass}>
              Sign out
            </button>
          </form>
        </>
      ) : isSignedIn ? (
        <>
          {isAdmin ? (
            <Link href="/dashboard/login" className={actionClass}>
              Open analytics dashboard
            </Link>
          ) : null}
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className={actionClass}
              title={email ? `Signed in as ${email}` : undefined}
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link href="/login" className={actionClass}>
          Sign in
        </Link>
      )}
      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </div>
  );
}
