import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";

export const COOKIE_NAME = "dashboard_session";

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createDashboardSessionHash() {
  return sha256(`${getServerEnv().DASHBOARD_PASSCODE}:dashboard-access`);
}

export async function hasDashboardSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  const expected = await createDashboardSessionHash();
  return cookieValue === expected;
}

export async function requireDashboardSession() {
  if (!(await hasDashboardSession())) {
    redirect("/dashboard/login");
  }
}
