import { NextResponse } from "next/server";
import { getAdminApiAccess, normalizeEmail } from "@/lib/access";
import { hasDashboardSession } from "@/lib/dashboard-auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const accessResult = await getAdminApiAccess();
  if (!accessResult.ok) {
    return NextResponse.json({ message: accessResult.message }, { status: accessResult.status });
  }

  if (!(await hasDashboardSession())) {
    return NextResponse.json({ message: "Unlock the dashboard first." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    email?: string;
    is_active?: boolean;
  };

  if (!payload.email?.trim()) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.from("allowed_users").insert({
    email: normalizeEmail(payload.email),
    role: "admin",
    is_active: payload.is_active ?? true,
  } as never);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const accessResult = await getAdminApiAccess();
  if (!accessResult.ok) {
    return NextResponse.json({ message: accessResult.message }, { status: accessResult.status });
  }

  if (!(await hasDashboardSession())) {
    return NextResponse.json({ message: "Unlock the dashboard first." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    id?: string;
    email?: string;
    is_active?: boolean;
  };

  if (!payload.id) {
    return NextResponse.json({ message: "User id is required." }, { status: 400 });
  }

  if (!payload.email?.trim()) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("allowed_users")
    .update({
      email: normalizeEmail(payload.email),
      role: "admin",
      is_active: payload.is_active ?? true,
    } as never)
    .eq("id", payload.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
