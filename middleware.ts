import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIE_NAME, createDashboardSessionHash } from "@/lib/dashboard-auth";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/dashboard/login") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const expected = await createDashboardSessionHash();

  if (!cookie || cookie !== expected) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
