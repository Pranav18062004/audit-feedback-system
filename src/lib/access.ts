import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { AllowedUser } from "@/lib/supabase/types";
import {
  getSupabaseServerClient,
  getSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export type CurrentUserAccess = {
  user: User | null;
  email: string | null;
  allowedUser: AllowedUser | null;
  isAllowed: boolean;
  isAdmin: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getAllowedUserByEmail(email: string) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("allowed_users")
    .select("id, email, role, is_active, created_at, updated_at")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load allowed user: ${error.message}`);
  }

  if (!data || !data.is_active) {
    return null;
  }

  return data as AllowedUser;
}

export async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return {
      user: null,
      email: null,
      allowedUser: null,
      isAllowed: false,
      isAdmin: false,
    };
  }

  const email = normalizeEmail(user.email);
  const allowedUser = await getAllowedUserByEmail(email);

  return {
    user,
    email,
    allowedUser,
    isAllowed: true,
    isAdmin: allowedUser?.role === "admin",
  };
}

export async function requireAllowedUser(redirectTo = "/") {
  const access = await getCurrentUserAccess();

  if (!access.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return access;
}

export async function requireAdminUser(redirectTo = "/dashboard") {
  const access = await requireAllowedUser(redirectTo);

  if (!access.isAdmin) {
    redirect("/");
  }

  return access;
}

export async function getAllowedApiAccess() {
  const access = await getCurrentUserAccess();

  if (!access.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Sign in is required.",
    };
  }

  if (!access.email) {
    return {
      ok: false as const,
      status: 403,
      message: "A verified Google email is required.",
    };
  }

  return {
    ok: true as const,
    access,
  };
}

export async function getAdminApiAccess() {
  const result = await getAllowedApiAccess();
  if (!result.ok) {
    return result;
  }

  if (!result.access.isAdmin) {
    return {
      ok: false as const,
      status: 403,
      message: "Admin access is required.",
    };
  }

  return result;
}
