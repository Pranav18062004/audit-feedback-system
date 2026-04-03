import Papa from "papaparse";
import { NextResponse } from "next/server";
import { hasDashboardSession } from "@/lib/dashboard-auth";
import { getFeedbackExportRows } from "@/lib/queries";

export async function GET(request: Request) {
  if (!(await hasDashboardSession())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const storeId = searchParams.get("storeId") ?? undefined;

  if (!startDate || !endDate) {
    return new NextResponse("Missing date range.", { status: 400 });
  }

  const rows = await getFeedbackExportRows({ startDate, endDate }, storeId);
  const normalizedRows = rows.map((row) => {
    const base: Record<string, string | number> = {
      id: row.id,
      store_id: row.store_id,
      store_name: row.stores?.name ?? "",
      store_code: row.stores?.code ?? "",
      created_at: row.created_at,
      comments: row.comments ?? "",
    };

    for (const rating of row.feedback_ratings ?? []) {
      if (rating.questions?.slug) {
        base[`rating_${rating.questions.slug}`] = rating.rating;
      }
    }

    return base;
  });
  const csv = Papa.unparse(normalizedRows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="audit-feedback-export.csv"',
    },
  });
}
