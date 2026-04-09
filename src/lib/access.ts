import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { AllowedUser, UserProfile } from "@/lib/supabase/types";
import {
  getSupabaseServerClient,
  getSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export type CurrentUserAccess = {
  user: User | null;
  email: string | null;
  allowedUser: AllowedUser | null;
  profile: UserProfile | null;
  fullName: string | null;
  isAllowed: boolean;
  isAdmin: boolean;
  hasProfile: boolean;
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

export async function getUserProfileById(userId: string) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user profile: ${error.message}`);
  }

  return (data as UserProfile | null) ?? null;
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
      profile: null,
      fullName: null,
      isAllowed: false,
      isAdmin: false,
      hasProfile: false,
    };
  }

  const email = normalizeEmail(user.email);
  const [allowedUser, profile] = await Promise.all([
    getAllowedUserByEmail(email),
    getUserProfileById(user.id),
  ]);

  return {
    user,
    email,
    allowedUser,
    profile,
    fullName: profile?.full_name ?? null,
    isAllowed: true,
    isAdmin: allowedUser?.role === "admin",
    hasProfile: Boolean(profile),
  };
}

export async function requireAllowedUser(redirectTo = "/") {
  const access = await getCurrentUserAccess();

  if (!access.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return access;
}

export async function requireProfiledUser(redirectTo = "/") {
  const access = await requireAllowedUser(redirectTo);

  if (!access.hasProfile) {
    redirect(`/welcome?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return access;
}

export async function requireAdminUser(redirectTo = "/dashboard") {
  const access = await requireProfiledUser(redirectTo);

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

export async function getProfiledApiAccess() {
  const result = await getAllowedApiAccess();
  if (!result.ok) {
    return result;
  }

  if (!result.access.hasProfile || !result.access.fullName) {
    return {
      ok: false as const,
      status: 409,
      message: "Please complete your profile before submitting feedback.",
    };
  }

  return result;
}

export async function getAdminApiAccess() {
  const result = await getProfiledApiAccess();
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
