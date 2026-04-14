create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  region text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.allowed_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint allowed_users_email_format check (position('@' in email) > 1),
  constraint allowed_users_email_lowercase check (email = lower(email))
);

create unique index if not exists allowed_users_email_idx on public.allowed_users (email);
create index if not exists allowed_users_role_active_idx on public.allowed_users (role, is_active, created_at);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_email_format check (position('@' in email) > 1),
  constraint user_profiles_email_lowercase check (email = lower(email))
);

create unique index if not exists user_profiles_email_idx on public.user_profiles (email);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  submitted_by_name text,
  submitted_by_email text,
  comments text check (char_length(coalesce(comments, '')) <= 500)
);

update public.feedback
set submitted_by_name = coalesce(submitted_by_name, 'Legacy user')
where submitted_by_name is null;

alter table public.feedback
alter column submitted_by_name set not null;

update public.feedback
set submitted_by_email = coalesce(submitted_by_email, 'legacy@unknown.local')
where submitted_by_email is null;

alter table public.feedback
alter column submitted_by_email set not null;

create index if not exists feedback_store_id_idx on public.feedback (store_id);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_store_created_idx on public.feedback (store_id, created_at desc);
create index if not exists feedback_submitted_by_email_idx on public.feedback (submitted_by_email);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists questions_active_order_idx on public.questions (is_active, sort_order, created_at);

create table if not exists public.feedback_ratings (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  rating integer,
  created_at timestamptz not null default timezone('utc', now()),
  unique (feedback_id, question_id)
);

alter table public.feedback_ratings
alter column rating drop not null;

alter table public.feedback_ratings
drop constraint if exists feedback_ratings_rating_check;

alter table public.feedback_ratings
add constraint feedback_ratings_rating_check
check (rating is null or rating between 1 and 10);

create index if not exists feedback_ratings_feedback_id_idx on public.feedback_ratings (feedback_id);
create index if not exists feedback_ratings_question_id_idx on public.feedback_ratings (question_id);

create table if not exists public.store_metrics (
  store_id uuid not null references public.stores(id) on delete cascade,
  metric_date date not null,
  feedback_count integer not null default 0 check (feedback_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  rating_sums jsonb not null default '{}'::jsonb,
  rating_counts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (store_id, metric_date)
);

create index if not exists store_metrics_metric_date_idx on public.store_metrics (metric_date desc);
create index if not exists store_metrics_store_metric_idx on public.store_metrics (store_id, metric_date desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_store_metrics_touch_updated_at on public.store_metrics;
create trigger trg_store_metrics_touch_updated_at
before update on public.store_metrics
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_questions_touch_updated_at on public.questions;
create trigger trg_questions_touch_updated_at
before update on public.questions
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_allowed_users_touch_updated_at on public.allowed_users;
create trigger trg_allowed_users_touch_updated_at
before update on public.allowed_users
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_user_profiles_touch_updated_at on public.user_profiles;
create trigger trg_user_profiles_touch_updated_at
before update on public.user_profiles
for each row
execute function public.touch_updated_at();

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.upsert_store_metrics(
  p_store_id uuid,
  p_created_at timestamptz,
  p_comments text,
  p_rating_sums jsonb,
  p_rating_counts jsonb
)
returns void
language plpgsql
set search_path = public
as $$
declare
  metric_day date;
begin
  metric_day := timezone('utc', p_created_at)::date;

  insert into public.store_metrics (
    store_id,
    metric_date,
    feedback_count,
    comments_count,
    rating_sums,
    rating_counts
  )
  values (
    p_store_id,
    metric_day,
    1,
    case when nullif(trim(coalesce(p_comments, '')), '') is null then 0 else 1 end,
    p_rating_sums,
    p_rating_counts
  )
  on conflict (store_id, metric_date)
  do update set
    feedback_count = public.store_metrics.feedback_count + 1,
    comments_count = public.store_metrics.comments_count
      + case when nullif(trim(coalesce(p_comments, '')), '') is null then 0 else 1 end,
    rating_sums = (
      select jsonb_object_agg(key, value)
      from (
        select
          key,
          sum(value)::text::jsonb as value
        from (
          select key, value::numeric as value
          from jsonb_each_text(public.store_metrics.rating_sums)
          union all
          select key, value::numeric as value
          from jsonb_each_text(p_rating_sums)
        ) merged
        group by key
      ) aggregated
    ),
    rating_counts = (
      select jsonb_object_agg(key, value)
      from (
        select
          key,
          sum(value)::text::jsonb as value
        from (
          select key, value::numeric as value
          from jsonb_each_text(public.store_metrics.rating_counts)
          union all
          select key, value::numeric as value
          from jsonb_each_text(p_rating_counts)
        ) merged
        group by key
      ) aggregated
    );
end;
$$;

drop function if exists public.submit_feedback(uuid, text, jsonb);
drop function if exists public.submit_feedback(text, uuid, text, jsonb);
create or replace function public.submit_feedback(
  p_submitted_by_name text,
  p_submitted_by_email text,
  p_store_id uuid,
  p_comments text default null,
  p_ratings jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_feedback_id uuid;
  v_created_at timestamptz := timezone('utc', now());
  v_rating jsonb;
  v_name text;
  v_email text;
  v_question_id uuid;
  v_score integer;
  v_rating_sums jsonb := '{}'::jsonb;
  v_rating_counts jsonb := '{}'::jsonb;
  v_active_question_count integer;
  v_submitted_question_count integer;
begin
  v_name := trim(coalesce(p_submitted_by_name, ''));
  v_email := lower(trim(coalesce(p_submitted_by_email, '')));

  if v_name = '' then
    raise exception 'A submitter name is required.';
  end if;

  if v_email = '' then
    raise exception 'A verified email is required.';
  end if;

  if not exists (
    select 1
    from public.stores
    where id = p_store_id
      and is_active = true
  ) then
    raise exception 'Store not found or inactive.';
  end if;

  select count(*)
  into v_active_question_count
  from public.questions
  where is_active = true;

  select count(distinct (value ->> 'question_id')::uuid)
  into v_submitted_question_count
  from jsonb_array_elements(p_ratings);

  if v_active_question_count = 0 then
    raise exception 'At least one active question is required.';
  end if;

  if v_submitted_question_count <> v_active_question_count then
    raise exception 'Please answer all active questions.';
  end if;

  insert into public.feedback (
    store_id,
    created_at,
    submitted_by_name,
    submitted_by_email,
    comments
  )
  values (
    p_store_id,
    v_created_at,
    v_name,
    v_email,
    nullif(trim(coalesce(p_comments, '')), '')
  )
  returning id into v_feedback_id;

  for v_rating in
    select value from jsonb_array_elements(p_ratings)
  loop
    v_question_id := (v_rating ->> 'question_id')::uuid;
    v_score := nullif(v_rating ->> 'rating', '')::integer;

    if v_question_id is null then
      raise exception 'Each rating must include a valid question.';
    end if;

    if not exists (
      select 1
      from public.questions
      where id = v_question_id
        and is_active = true
    ) then
      raise exception 'Question is invalid or inactive.';
    end if;

    if v_score is null then
      continue;
    end if;

    if v_score < 1 or v_score > 10 then
      raise exception 'Ratings must be between 1 and 10, or N/A.';
    end if;

    insert into public.feedback_ratings (feedback_id, question_id, rating, created_at)
    values (v_feedback_id, v_question_id, v_score, v_created_at);

    v_rating_sums := jsonb_set(
      v_rating_sums,
      array[v_question_id::text],
      to_jsonb(coalesce((v_rating_sums ->> v_question_id::text)::integer, 0) + v_score),
      true
    );

    v_rating_counts := jsonb_set(
      v_rating_counts,
      array[v_question_id::text],
      to_jsonb(coalesce((v_rating_counts ->> v_question_id::text)::integer, 0) + 1),
      true
    );
  end loop;

  perform public.upsert_store_metrics(
    p_store_id,
    v_created_at,
    p_comments,
    v_rating_sums,
    v_rating_counts
  );

  return v_feedback_id;
end;
$$;

alter table public.stores enable row level security;
alter table public.allowed_users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.feedback enable row level security;
alter table public.questions enable row level security;
alter table public.feedback_ratings enable row level security;
alter table public.store_metrics enable row level security;

drop policy if exists "stores_select_public" on public.stores;
drop policy if exists "stores_select_authenticated" on public.stores;
create policy "stores_select_authenticated"
on public.stores
for select
to authenticated
using (is_active = true);

drop policy if exists "questions_select_public" on public.questions;
drop policy if exists "questions_select_authenticated" on public.questions;
create policy "questions_select_authenticated"
on public.questions
for select
to authenticated
using (is_active = true);

drop policy if exists "allowed_users_select_self" on public.allowed_users;
create policy "allowed_users_select_self"
on public.allowed_users
for select
to authenticated
using (
  is_active = true
  and email = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "user_profiles_select_self" on public.user_profiles;
create policy "user_profiles_select_self"
on public.user_profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "user_profiles_insert_self" on public.user_profiles;
create policy "user_profiles_insert_self"
on public.user_profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and email = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "user_profiles_update_self" on public.user_profiles;
create policy "user_profiles_update_self"
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and email = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "feedback_insert_none" on public.feedback;
create policy "feedback_insert_none"
on public.feedback
for insert
to authenticated
with check (false);

drop policy if exists "feedback_select_none" on public.feedback;
create policy "feedback_select_none"
on public.feedback
for select
to authenticated
using (false);

drop policy if exists "feedback_ratings_select_none" on public.feedback_ratings;
create policy "feedback_ratings_select_none"
on public.feedback_ratings
for select
to authenticated
using (false);

drop policy if exists "feedback_ratings_insert_none" on public.feedback_ratings;
create policy "feedback_ratings_insert_none"
on public.feedback_ratings
for insert
to authenticated
with check (false);

drop policy if exists "store_metrics_select_none" on public.store_metrics;
create policy "store_metrics_select_none"
on public.store_metrics
for select
to authenticated
using (false);

comment on table public.allowed_users is 'Application access list managed by admins. Only active email addresses can use the app.';
comment on table public.user_profiles is 'First-time profile names collected from signed-in users and reused for future submissions.';
comment on table public.feedback is 'Authenticated audit feedback with the submitter name and verified email recorded for traceability.';
comment on table public.questions is 'Manager-configurable 1-10 rating questions used by the feedback form, with N/A available per submission.';

grant execute on function public.submit_feedback(text, text, uuid, text, jsonb) to authenticated;
