import { Suspense } from "react";
import { PasscodeForm } from "@/components/passcode-form";

export default function DashboardLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center pb-8">
      <section className="glass-panel w-full rounded-[36px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
          Protected analytics
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Unlock the dashboard
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
          Enter the shared passcode to view aggregate metrics and CSV exports. This gate protects
          analytics without collecting user identities.
        </p>
        <div className="mt-8">
          <Suspense>
            <PasscodeForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
