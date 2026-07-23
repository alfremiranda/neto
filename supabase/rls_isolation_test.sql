-- Neto — RLS tenant-isolation proof. Phase 1, workstream 1.
-- Run in Supabase Dashboard → SQL Editor on DEV. Results come back as a table
-- (step, result) so they show in the grid — no need to read NOTICE logs.
-- Test rows are inserted and then deleted; nothing is left behind.
--
-- Uses two REAL users from auth.users (months.user_id has a FK to auth.users, so
-- synthetic ids fail the FK before RLS is reached). Needs >= 2 users in dev.
-- It reads them as the table owner, then drops to `authenticated` so RLS applies
-- exactly like a real client (auth.uid() reads request.jwt.claims->>'sub').

create temp table if not exists _rls_results (step text primary key, result text);
truncate _rls_results;

do $$
declare
  uidA uuid; uidB uuid; n int; blocked boolean := false;
  r0 text; r1 text; r2 text; r3 text; r4 text;
begin
  select id into uidA from auth.users order by created_at limit 1;
  select id into uidB from auth.users where id <> uidA order by created_at limit 1;
  if uidA is null or uidB is null then
    insert into _rls_results values ('T0', 'SKIP: need >= 2 users in auth.users (dev has fewer). Create a 2nd test account and re-run.');
    return;
  end if;

  -- Enforce RLS from here by acting as the `authenticated` role.
  perform set_config('role', 'authenticated', true);

  -- A inserts a private row.
  perform set_config('request.jwt.claims', json_build_object('sub', uidA, 'role', 'authenticated')::text, true);
  insert into public.months (user_id, key, data) values (uidA, '__rlsproof_A', '{"s":"A"}');
  select count(*) into n from public.months where user_id = uidA and key = '__rlsproof_A';
  r0 := format('A inserts + sees own row (expect 1): %s  ->  %s', n, case when n = 1 then 'PASS' else 'FAIL' end);

  -- Switch to B.
  perform set_config('request.jwt.claims', json_build_object('sub', uidB, 'role', 'authenticated')::text, true);

  select count(*) into n from public.months where user_id = uidA;
  r1 := format('B sees A rows (expect 0): %s  ->  %s', n, case when n = 0 then 'PASS' else 'FAIL — BREACH' end);

  select count(*) into n from public.months where key = '__rlsproof_A';
  r2 := format('B reads A by key (expect 0): %s  ->  %s', n, case when n = 0 then 'PASS' else 'FAIL — BREACH' end);

  with u as (update public.months set data = '{"hacked":true}' where key = '__rlsproof_A' returning 1)
  select count(*) into n from u;
  r3 := format('B updates A row (expect 0 affected): %s  ->  %s', n, case when n = 0 then 'PASS' else 'FAIL — BREACH' end);

  begin
    insert into public.months (user_id, key, data) values (uidA, '__rlsproof_spoof', '{}');
  exception when others then blocked := true;
  end;
  r4 := format('B insert-as-A blocked (expect true): %s  ->  %s', blocked, case when blocked then 'PASS' else 'FAIL — BREACH' end);

  -- Back to owner: clean up the test rows and record results (temp table is owner-owned).
  perform set_config('role', 'postgres', true);
  delete from public.months where key in ('__rlsproof_A', '__rlsproof_spoof');
  insert into _rls_results values ('T0', r0), ('T1', r1), ('T2', r2), ('T3', r3), ('T4', r4);
end $$;

select step, result from _rls_results order by step;
drop table _rls_results;
