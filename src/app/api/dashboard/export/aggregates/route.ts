import Papa from "papaparse";
import { NextResponse } from "next/server";
import { getAdminApiAccess } from "@/lib/access";
import { hasDashboardSession } from "@/lib/dashboard-auth";
import { getAggregateExportRows } from "@/lib/queries";

export async function GET(request: Request) {
  const accessResult = await getAdminApiAccess();
  if (!accessResult.ok) {
    return new NextResponse(accessResult.message, { status: accessResult.status });
  }

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

  const rows = await getAggregateExportRows({ startDate, endDate }, storeId);
  const csv = Papa.unparse(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="audit-aggregate-export.csv"',
    },
  });
}
