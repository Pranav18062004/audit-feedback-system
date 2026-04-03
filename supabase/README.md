# Supabase Setup

## 1. Create the project
- Create a new Supabase project.
- Copy the project URL, anon key, and service role key into `.env.local`.

## 2. Run schema and seed scripts
- Open the Supabase SQL editor.
- Run `supabase/schema.sql`.
- Run `supabase/seed.sql`.

## 3. Confirm required tables
- `stores`
- `questions`
- `feedback`
- `feedback_ratings`
- `store_metrics`

## 4. RLS behavior
- `stores`: anonymous `SELECT` allowed for active stores.
- `questions`: anonymous `SELECT` allowed for active questions.
- `feedback`: anonymous direct `SELECT` denied.
- `feedback_ratings`: anonymous direct `SELECT` denied.
- `store_metrics`: browser access denied; reads should go through server-side dashboard code using the service role key.

## 5. API usage examples

### Anonymous feedback submit
```ts
const { data, error } = await supabase.rpc("submit_feedback", {
  p_store_id: "store-uuid",
  p_comments: "Queue was short and staff were helpful.",
  p_ratings: [
    { question_id: "question-uuid-1", rating: 4 },
    { question_id: "question-uuid-2", rating: 5 },
  ],
});
```

### Public active questions
```ts
const { data, error } = await supabase
  .from("questions")
  .select("id, slug, title, description, sort_order")
  .eq("is_active", true)
  .order("sort_order");
```

### Public store list
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
