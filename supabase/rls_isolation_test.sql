-- Neto — RLS tenant-isolation proof. Phase 1, workstream 1.
-- Run in Supabase Dashboard → SQL Editor. SAFE ON PROD: every write to
-- public.months happens inside a plpgsql subtransaction that is ALWAYS rolled
-- back, so no real row is ever net-changed — even if a policy were weaker than
-- expected. Results still come back as a grid (step, result) via a temp table
-- that survives the subtransaction (so it is not rolled back with the writes).
--
-- Uses two REAL users from auth.users (months.user_id has a FK to auth.users, so
-- synthetic ids fail the FK before RLS is reached). Needs >= 2 users. Reads them
-- as the table owner, then drops to `authenticated` so RLS applies exactly like a
-- real client (auth.uid() reads request.jwt.claims->>'sub').

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
    insert into _rls_results values ('T0', 'SKIP: need >= 2 users in auth.users. Create a 2nd account and re-run.');
    return;
  end if;

  -- All month writes happen inside this subtransaction, which we ALWAYS roll back
  -- (via a sentinel raise below). Nothing here can leave a persisted row behind.
  begin
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

    -- Force the subtransaction to roll back: undoes every write above (SET LOCAL
    -- role reverts too, so we are back to the owner afterwards).
    raise exception '__rls_rollback__';
  exception when others then
    if sqlerrm <> '__rls_rollback__' then
      r0 := coalesce(r0, format('T0 ERROR (not a rollback sentinel): %s', sqlerrm));
    end if;
  end;

  -- Writes rolled back, role back to owner. Record results into the temp table.
  perform set_config('role', 'postgres', true);
  insert into _rls_results values ('T0', r0), ('T1', r1), ('T2', r2), ('T3', r3), ('T4', r4);
end $$;

select step, result from _rls_results order by step;
drop table _rls_results;
