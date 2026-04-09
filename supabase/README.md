# Supabase Setup

## 1. Create the project
- Create a new Supabase project.
- Copy the project URL, anon key, and service role key into `.env.local`.
- In `Authentication` -> `URL Configuration`, add:
  - `http://localhost:3000/auth/callback`
  - your production `https://.../auth/callback`
- In `Authentication` -> `Providers` -> `Google`, enable Google and paste the Google OAuth client ID and secret.
- In Google Cloud, add Supabase's provider callback URL (shown on that Google provider page) as an authorized redirect URI.

## 2. Run schema and seed scripts
- Open the Supabase SQL editor.
- Run `supabase/schema.sql`.
- Run `supabase/seed.sql`.
- Add your first admin email:

```sql
insert into public.allowed_users (email, role, is_active)
values ('admin@yourcompany.com', 'admin', true);
```

## 3. Confirm required tables
- `stores`
- `allowed_users`
- `questions`
- `feedback`
- `feedback_ratings`
- `store_metrics`

## 4. RLS behavior
- `stores`: authenticated `SELECT` allowed for active stores.
- `questions`: authenticated `SELECT` allowed for active questions.
- `allowed_users`: authenticated users can read only their own active access row.
- `feedback`: direct `SELECT` denied.
- `feedback_ratings`: direct `SELECT` denied.
- `store_metrics`: browser access denied; reads should go through server-side dashboard code using the service role key.

## 5. API usage examples

### Authenticated feedback submit
```ts
const { data, error } = await supabase.rpc("submit_feedback", {
  p_submitted_by_email: "auditor@company.com",
  p_store_id: "store-uuid",
  p_comments: "Queue was short and staff were helpful.",
  p_ratings: [
    { question_id: "question-uuid-1", rating: 8 },
    { question_id: "question-uuid-2", rating: 9 },
  ],
});
```

### Active questions for signed-in users
```ts
const { data, error } = await supabase
  .from("questions")
  .select("id, slug, title, description, sort_order")
  .eq("is_active", true)
  .order("sort_order");
```

### Active store list for signed-in users
```ts
const { data, error } = await supabase
  .from("stores")
  .select("id, name, code, region")
  .eq("is_active", true)
  .order("name");
```

### Server-side metrics read
```ts
const { data, error } = await serviceRoleClient
  .from("store_metrics")
  .select("*")
  .gte("metric_date", "2026-01-01")
  .lte("metric_date", "2026-01-31");
```
