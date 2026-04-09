import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PasscodeForm } from "@/components/passcode-form";
import { requireAdminUser } from "@/lib/access";
import { hasDashboardSession } from "@/lib/dashboard-auth";

type DashboardLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardLoginPage({ searchParams }: DashboardLoginPageProps) {
  await requireAdminUser("/dashboard");
  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" && params.redirectTo.startsWith("/dashboard")
      ? params.redirectTo
      : "/dashboard";

  if (await hasDashboardSession()) {
    redirect(redirectTo);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center pb-8">
      <section className="panel w-full p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Dashboard access</h2>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          You are signed in as an admin. Enter the shared passcode to unlock analytics and exports.
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
