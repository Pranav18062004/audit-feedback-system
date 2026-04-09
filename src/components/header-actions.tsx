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

  return (
    <div className="flex items-center gap-2">
      {inDashboard ? (
        <>
          <Link href="/" className="button-secondary">
            Home
          </Link>
          <form action="/api/dashboard/logout" method="post">
            <button type="submit" className="button-secondary">
              Lock
            </button>
          </form>
          <form action="/auth/logout" method="post">
            <button type="submit" className="button-secondary">
              Sign out
            </button>
          </form>
        </>
      ) : isSignedIn ? (
        <>
          {isAdmin ? (
            <Link href="/dashboard/login" className="button-secondary">
              Open analytics dashboard
            </Link>
          ) : null}
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="button-secondary"
              title={email ? `Signed in as ${email}` : undefined}
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link href="/login" className="button-secondary">
          Sign in
        </Link>
      )}
      <ThemeToggle />
    </div>
  );
}
