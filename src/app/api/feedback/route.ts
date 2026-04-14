import { NextResponse } from "next/server";
import { getProfiledApiAccess } from "@/lib/access";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type FeedbackRequest = {
  storeId?: string;
  comments?: string | null;
  ratings?: Array<{
    questionId?: string;
    rating?: number | null;
  }>;
};

export async function POST(request: Request) {
  const accessResult = await getProfiledApiAccess();
  if (!accessResult.ok) {
    return NextResponse.json({ message: accessResult.message }, { status: accessResult.status });
  }

  const payload = (await request.json().catch(() => null)) as FeedbackRequest | null;

  if (!payload?.storeId || !Array.isArray(payload.ratings) || payload.ratings.length === 0) {
    return NextResponse.json({ message: "Invalid feedback payload." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const rpcPayload = {
    p_submitted_by_name: accessResult.access.fullName,
    p_submitted_by_email: accessResult.access.email,
    p_store_id: payload.storeId,
    p_comments: payload.comments?.trim() || null,
    p_ratings: payload.ratings.map((rating) => ({
      question_id: rating.questionId,
      rating: rating.rating,
    })),
  };

  const { error } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: unknown,
    ) => Promise<{ error: { message: string } | null }>
  )("submit_feedback", rpcPayload);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
