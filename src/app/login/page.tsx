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

  if (access.isAllowed) {
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
          Continue with Google using an email address that has already been approved by an admin.
        </p>

        {access.user && !access.isAllowed ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              This email is signed in, but it has not been approved for access. Ask an admin to add
              it first.
            </div>
            <form action="/auth/logout" method="post">
              <button type="submit" className="button-primary w-full">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-8">
            <GoogleLoginButton redirectTo={redirectTo} error={error} />
          </div>
        )}
      </section>
    </div>
  );
}
