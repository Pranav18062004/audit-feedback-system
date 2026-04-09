"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AllowedUser, AllowedUserRole } from "@/lib/supabase/types";

type AllowedUserManagerProps = {
  users: AllowedUser[];
};

type AllowedUserFormState = {
  email: string;
  role: AllowedUserRole;
  is_active: boolean;
};

export function AllowedUserManager({ users }: AllowedUserManagerProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreating(true);
    setCreateError(null);

    const formData = new FormData(form);
    const response = await fetch("/api/dashboard/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? "user"),
        is_active: formData.get("is_active") === "on",
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setCreateError(payload?.message ?? "Unable to add user.");
      setCreating(false);
      return;
    }

    form.reset();
    setCreating(false);
    router.refresh();
  }

  async function updateUser(id: string, state: AllowedUserFormState) {
    setEditingId(id);
    setEditError(null);

    const response = await fetch("/api/dashboard/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...state,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setEditError(payload?.message ?? "Unable to update user.");
      setEditingId(null);
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <h3 className="text-lg font-semibold text-foreground">Add an approved email</h3>
        <p className="mt-1 text-sm text-muted">
          Only active email addresses listed here can sign in to the application.
        </p>
        <form onSubmit={createUser} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground lg:col-span-2">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              required
              className="field-input"
              placeholder="name@company.com"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Role</span>
            <select name="role" defaultValue="user" className="field-input">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
            <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4 rounded border-card-border" />
            Active
          </label>
          <button type="submit" disabled={creating} className="button-primary disabled:opacity-60">
            {creating ? "Saving..." : "Add user"}
          </button>
        </form>
        {createError ? <p className="mt-3 text-sm font-medium text-red-600">{createError}</p> : null}
      </section>

      <section className="panel p-5">
        <h3 className="text-lg font-semibold text-foreground">Approved users</h3>
        <p className="mt-1 text-sm text-muted">
          Promote admins, revoke access, or correct email addresses here.
        </p>
        <div className="mt-5 space-y-4">
          {users.map((user) => (
            <AllowedUserEditor
              key={user.id}
              user={user}
              isSaving={editingId === user.id}
              onSave={updateUser}
            />
          ))}
        </div>
        {editError ? <p className="mt-3 text-sm font-medium text-red-600">{editError}</p> : null}
      </section>
    </div>
  );
}

function AllowedUserEditor({
  user,
  isSaving,
  onSave,
}: {
  user: AllowedUser;
  isSaving: boolean;
  onSave: (id: string, state: AllowedUserFormState) => Promise<void>;
}) {
  const [state, setState] = useState<AllowedUserFormState>({
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(user.id, state);
      }}
      className="subtle-panel grid gap-4 p-4 lg:grid-cols-[1fr_160px]"
    >
      <div className="grid gap-4">
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Email</span>
          <input
            type="email"
            value={state.email}
            onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))}
            required
            className="field-input"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Role</span>
          <select
            value={state.role}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                role: event.target.value as AllowedUserRole,
              }))
            }
            className="field-input"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4">
        <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={state.is_active}
            onChange={(event) =>
              setState((current) => ({ ...current, is_active: event.target.checked }))
            }
            className="h-4 w-4 rounded border-card-border"
          />
          Active
        </label>
        <div className="text-sm text-muted">
          Added {new Date(user.created_at).toLocaleDateString("en-IN")}
        </div>
        <button type="submit" disabled={isSaving} className="button-primary disabled:opacity-60">
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
