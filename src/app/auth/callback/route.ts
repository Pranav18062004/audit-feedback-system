import { NextResponse } from "next/server";
import { getAllowedUserByEmail, getUserProfileById } from "@/lib/access";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSafeRedirectTo(value: string | null) {
  if (value && value.startsWith("/")) {
    return value;
  }

  return "/";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = getSafeRedirectTo(requestUrl.searchParams.get("redirectTo"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user?.email) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  const [allowedUser, profile] = await Promise.all([
    getAllowedUserByEmail(user.email),
    getUserProfileById(user.id),
  ]);

  if (!profile) {
    const welcomeUrl = new URL("/welcome", request.url);
    welcomeUrl.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(welcomeUrl);
  }

  const nextPath =
    redirectTo.startsWith("/dashboard")
      ? allowedUser?.role === "admin"
        ? `/dashboard/login?redirectTo=${encodeURIComponent(redirectTo)}`
        : "/"
      : redirectTo;

  return NextResponse.redirect(new URL(nextPath, request.url));
}
