-- Neto — RLS & schema audit (READ-ONLY). Phase 1, workstream 1.
-- Run in Supabase Dashboard → SQL Editor. Run it on DEV first, then PROD.
-- It changes nothing; it only reports the current state so we can harden safely.
-- Paste the four result sets back.

-- 1) Every table in `public` and whether RLS is enabled/forced.
select
  c.relname                              as table,
  c.relrowsecurity                       as rls_enabled,
  c.relforcerowsecurity                  as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- 2) All RLS policies in `public` (the actual rules).
select
  tablename,
  policyname,
  cmd,                    -- SELECT / INSERT / UPDATE / DELETE / ALL
  roles,                  -- which DB roles it applies to (anon, authenticated, …)
  qual        as using_expr,      -- row visibility (USING)
  with_check  as with_check_expr  -- write guard (WITH CHECK)
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) Columns of `months` (confirm user_id exists, its type, PK).
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'months'
order by ordinal_position;

-- 4) Table-level grants to anon/authenticated (RLS only matters if the role is granted at all).
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated')
order by table_name, grantee, privilege_type;

-- 5) Foreign keys on `months` + their ON DELETE action (W3 right-to-erasure:
--    confirm `user_id → auth.users` cascades, so deleting the auth user removes
--    the rows — no orphaned data). Expect: ON DELETE CASCADE (confdeltype 'c').
--    Verified on prod 2026-07-25: months_user_id_fkey ... ON DELETE CASCADE.
select conname as constraint,
       confdeltype as on_delete_code,        -- 'c' = cascade
       pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.months'::regclass and contype = 'f';
