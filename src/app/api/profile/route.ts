import { NextResponse } from "next/server";
import { getAllowedApiAccess, normalizeEmail } from "@/lib/access";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

type ProfileRequest = {
  fullName?: string;
  redirectTo?: string;
};

function getSafeRedirectTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") ? value : "/";
}

export async function POST(request: Request) {
  const accessResult = await getAllowedApiAccess();
  if (!accessResult.ok) {
    return NextResponse.json({ message: accessResult.message }, { status: accessResult.status });
  }

  const payload = (await request.json().catch(() => null)) as ProfileRequest | null;
  const fullName = payload?.fullName?.trim();

  if (!fullName || fullName.length < 2) {
    return NextResponse.json({ message: "Please enter a name with at least 2 characters." }, { status: 400 });
  }

  if (fullName.length > 100) {
    return NextResponse.json({ message: "Please keep the name under 100 characters." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.from("user_profiles").upsert({
    id: accessResult.access.user!.id,
    email: normalizeEmail(accessResult.access.email!),
    full_name: fullName,
  } as never);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const redirectTo = getSafeRedirectTo(payload?.redirectTo);
  const nextPath =
    redirectTo.startsWith("/dashboard") && accessResult.access.isAdmin
      ? `/dashboard/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : redirectTo.startsWith("/dashboard")
        ? "/"
        : redirectTo;

  return NextResponse.json({ redirectTo: nextPath });
}
