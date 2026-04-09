"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Store } from "@/lib/supabase/types";

type StoreManagerProps = {
  stores: Store[];
};

type StoreFormState = {
  name: string;
  code: string;
  region: string;
  is_active: boolean;
};

export function StoreManager({ stores }: StoreManagerProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function createStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreating(true);
    setCreateError(null);

    const formData = new FormData(form);
    const response = await fetch("/api/dashboard/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        code: String(formData.get("code") ?? ""),
        region: String(formData.get("region") ?? ""),
        is_active: formData.get("is_active") === "on",
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setCreateError(payload?.message ?? "Unable to create store.");
      setCreating(false);
      return;
    }

    form.reset();
    setCreating(false);
    router.refresh();
  }

  async function updateStore(id: string, state: StoreFormState) {
    setEditingId(id);
    setEditError(null);

    const response = await fetch("/api/dashboard/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...state,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setEditError(payload?.message ?? "Unable to update store.");
      setEditingId(null);
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <h3 className="text-lg font-semibold text-foreground">Add a store</h3>
        <p className="mt-1 text-sm text-muted">
          Create a store that will appear in the feedback list when active.
        </p>
        <form onSubmit={createStore} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Store name</span>
            <input name="name" required className="field-input" placeholder="Example: Millenium Downtown" />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Store code</span>
            <input name="code" required className="field-input" placeholder="Example: MD-101" />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground lg:col-span-2">
            <span>Region</span>
            <input name="region" className="field-input" placeholder="Optional region label" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
            <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4 rounded border-card-border" />
            Active in feedback form
          </label>
          <button type="submit" disabled={creating} className="button-primary disabled:opacity-60">
            {creating ? "Saving..." : "Create store"}
          </button>
        </form>
        {createError ? <p className="mt-3 text-sm font-medium text-red-600">{createError}</p> : null}
      </section>

      <section className="panel p-5">
        <h3 className="text-lg font-semibold text-foreground">Existing stores</h3>
        <p className="mt-1 text-sm text-muted">
          Edit store details or disable stores that should no longer receive feedback.
        </p>
        <div className="mt-5 space-y-4">
          {stores.map((store) => (
            <StoreEditor
              key={store.id}
              store={store}
              isSaving={editingId === store.id}
              onSave={updateStore}
            />
          ))}
        </div>
        {editError ? <p className="mt-3 text-sm font-medium text-red-600">{editError}</p> : null}
      </section>
    </div>
  );
}

function StoreEditor({
  store,
  isSaving,
  onSave,
}: {
  store: Store;
  isSaving: boolean;
  onSave: (id: string, state: StoreFormState) => Promise<void>;
}) {
  const [state, setState] = useState<StoreFormState>({
    name: store.name,
    code: store.code,
    region: store.region ?? "",
    is_active: store.is_active,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(store.id, state);
      }}
      className="subtle-panel grid gap-4 p-4 lg:grid-cols-[1fr_160px]"
    >
      <div className="grid gap-4">
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Name</span>
          <input
            value={state.name}
            onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
            required
            className="field-input"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Code</span>
            <input
              value={state.code}
              onChange={(event) => setState((current) => ({ ...current, code: event.target.value }))}
              required
              className="field-input"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Region</span>
            <input
              value={state.region}
              onChange={(event) => setState((current) => ({ ...current, region: event.target.value }))}
              className="field-input"
            />
          </label>
        </div>
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
          Created {new Date(store.created_at).toLocaleDateString("en-IN")}
        </div>
        <button type="submit" disabled={isSaving} className="button-primary disabled:opacity-60">
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
