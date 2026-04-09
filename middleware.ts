import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
