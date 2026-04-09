import { NextResponse } from "next/server";
import { getAdminApiAccess } from "@/lib/access";
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
    name?: string;
    code?: string;
    region?: string;
    is_active?: boolean;
  };

  const name = payload.name?.trim();
  const code = payload.code?.trim();

  if (!name) {
    return NextResponse.json({ message: "Store name is required." }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ message: "Store code is required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.from("stores").insert({
    name,
    code,
    region: payload.region?.trim() || null,
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
    name?: string;
    code?: string;
    region?: string;
    is_active?: boolean;
  };

  if (!payload.id) {
    return NextResponse.json({ message: "Store id is required." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const code = payload.code?.trim();

  if (!name) {
    return NextResponse.json({ message: "Store name is required." }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ message: "Store code is required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("stores")
    .update({
      name,
      code,
      region: payload.region?.trim() || null,
      is_active: payload.is_active ?? true,
    } as never)
    .eq("id", payload.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
