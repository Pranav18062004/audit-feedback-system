import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/dashboard-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function signOutAndRedirect(request: Request) {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}
