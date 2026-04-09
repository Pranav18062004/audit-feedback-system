import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/components/google-login-button";
import { getCurrentUserAccess } from "@/lib/access";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSafeRedirectTo(value: string | string[] | undefined) {
  if (typeof value === "string" && value.startsWith("/")) {
    return value;
  }

  return "/";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = getSafeRedirectTo(params.redirectTo);
  const error = typeof params.error === "string" ? params.error : null;
  const access = await getCurrentUserAccess();

  if (access.user) {
    if (redirectTo.startsWith("/dashboard")) {
      redirect(access.isAdmin ? `/dashboard/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/");
    }

    redirect(redirectTo);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center pb-8">
      <section className="panel w-full p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Continue with Google to submit feedback. Admin Google accounts will also see the dashboard option.
        </p>
        <div className="mt-8">
          <GoogleLoginButton redirectTo={redirectTo} error={error} />
        </div>
      </section>
    </div>
  );
}
