import { NextResponse } from "next/server";
import { hasDashboardSession } from "@/lib/dashboard-auth";
import { slugifyQuestionTitle } from "@/lib/question-utils";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

function normalizeSortOrder(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  if (!(await hasDashboardSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    title?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  };

  const title = payload.title?.trim();
  if (!title) {
    return NextResponse.json({ message: "Title is required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const baseSlug = slugifyQuestionTitle(title) || "question";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data } = await supabase.from("questions").select("id").eq("slug", slug).maybeSingle();
    if (!data) {
      break;
    }
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { error } = await supabase.from("questions").insert({
    slug,
    title,
    description: payload.description?.trim() || null,
    sort_order: normalizeSortOrder(payload.sort_order),
    is_active: payload.is_active ?? true,
  } as never);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await hasDashboardSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    id?: string;
    title?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  };

  if (!payload.id) {
    return NextResponse.json({ message: "Question id is required." }, { status: 400 });
  }

  const title = payload.title?.trim();
  if (!title) {
    return NextResponse.json({ message: "Title is required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data: existing } = await supabase
    .from("questions")
    .select("slug")
    .eq("id", payload.id)
    .maybeSingle();

  const slug = existing?.slug ?? (slugifyQuestionTitle(title) || "question");

  const { error } = await supabase
    .from("questions")
    .update({
      slug,
      title,
      description: payload.description?.trim() || null,
      sort_order: normalizeSortOrder(payload.sort_order),
      is_active: payload.is_active ?? true,
    } as never)
    .eq("id", payload.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
