import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminApiAccess } from "@/lib/access";
import { COOKIE_NAME, createDashboardSessionHash } from "@/lib/dashboard-auth";
import { getServerEnv } from "@/lib/env";
import { dashboardLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const accessResult = await getAdminApiAccess();
  if (!accessResult.ok) {
    return NextResponse.json({ message: accessResult.message }, { status: accessResult.status });
  }

  const payload = dashboardLoginSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (payload.data.passcode !== getServerEnv().DASHBOARD_PASSCODE) {
    return NextResponse.json({ message: "Incorrect passcode." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createDashboardSessionHash(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({
    redirectTo:
      payload.data.redirectTo && payload.data.redirectTo.startsWith("/dashboard")
        ? payload.data.redirectTo
        : "/dashboard",
  });
}
