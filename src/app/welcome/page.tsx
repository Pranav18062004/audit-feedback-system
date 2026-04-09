import { redirect } from "next/navigation";
import { NameOnboardingForm } from "@/components/name-onboarding-form";
import { getCurrentUserAccess, requireAllowedUser } from "@/lib/access";

type WelcomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSafeRedirectTo(value: string | string[] | undefined) {
  if (typeof value === "string" && value.startsWith("/")) {
    return value;
  }

  return "/";
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const params = await searchParams;
  const redirectTo = getSafeRedirectTo(params.redirectTo);
  await requireAllowedUser(redirectTo);
  const access = await getCurrentUserAccess();

  if (access.hasProfile) {
    if (redirectTo.startsWith("/dashboard")) {
      redirect(access.isAdmin ? `/dashboard/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/");
    }

    redirect(redirectTo);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center pb-8">
      <section className="panel w-full p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">One quick step</h2>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Tell us the name you want attached to your feedback submissions. We&apos;ll reuse it for
          all future responses.
        </p>
        <div className="mt-8">
          <NameOnboardingForm email={access.email ?? ""} redirectTo={redirectTo} />
        </div>
      </section>
    </div>
  );
}
