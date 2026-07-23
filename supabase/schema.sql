-- Neto — Supabase schema (canonical, multi-user).
-- Run in: Supabase Dashboard → SQL Editor.
--
-- This replaces the old single-user PoC schema (which had NO user_id and an open
-- `USING (true)` policy). The live dev and prod projects already match the core of
-- this (RLS on, per-user policy, unique(user_id, key)) — audited 2026-07-22.
--
-- Tenant isolation is enforced by RLS keyed on auth.uid(); the client's
-- `.eq('user_id', ...)` filter is only convenience, not the security boundary.

create table if not exists public.months (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  key        text        not null,                 -- month key 'YYYY-MM', or '_settings'
  data       jsonb       not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, key)                            -- one row per (user, key); required by the upsert onConflict
);

-- Row-Level Security: a user can only touch their own rows.
alter table public.months enable row level security;
alter table public.months force  row level security;  -- also apply RLS to the table owner / SECURITY DEFINER paths

-- Single ALL policy is equivalent to four per-command policies here, since both
-- the visibility (USING) and the write guard (WITH CHECK) are the same predicate.
drop policy if exists "anon_access"                     on public.months;  -- remove the old open PoC policy if present
drop policy if exists "Users can manage their own data" on public.months;
drop policy if exists "Users own their data"            on public.months;
create policy "Users own their data" on public.months
  for all
  to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The app only ever reads/writes while authenticated, so `anon` never needs table
-- access. RLS already blocks it (auth.uid() is null → no rows), but revoking the
-- grants removes the surface entirely.
revoke all on public.months from anon;
