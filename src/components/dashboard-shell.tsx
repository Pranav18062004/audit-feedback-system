import Link from "next/link";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Analytics dashboard</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Store performance at a glance
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Aggregates are served from precomputed daily metrics for fast store and network-wide reporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-card-border px-4 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent"
            >
              Global view
            </Link>
            <Link
              href="/dashboard/questions"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-card-border px-4 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent"
            >
              Manage questions
            </Link>
            <form action="/api/dashboard/logout" method="post">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong"
              >
                Lock dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
