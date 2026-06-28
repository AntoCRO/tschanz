-- ============================================================================
-- Rekruten-Bewertung — database fix
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run multiple times (idempotent).
--
-- Fixes three things:
--   1) Ratings won't save  -> the upsert needs a UNIQUE (event_id, recruit_id)
--      constraint, and open RLS so anyone can edit the shared rating.
--   2) Deleting a recruit  -> open RLS + ON DELETE CASCADE on child rows.
--   3) "Inactive" recruits -> purge the leftover deactivated rows.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Shared ratings: exactly ONE row per (event_id, recruit_id).
-- ---------------------------------------------------------------------------

-- Drop any old uniqueness (e.g. the per-evaluator one) on ratings.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.ratings'::regclass and contype = 'u'
  loop
    execute format('alter table public.ratings drop constraint %I', c.conname);
  end loop;
end $$;

-- De-duplicate: keep the most recently updated row per (event, recruit).
delete from public.ratings a
using public.ratings b
where a.event_id = b.event_id
  and a.recruit_id = b.recruit_id
  and (a.updated_at < b.updated_at
       or (a.updated_at = b.updated_at and a.id > b.id));

-- The uniqueness the app's upsert (onConflict: event_id,recruit_id) relies on.
alter table public.ratings
  add constraint ratings_event_recruit_key unique (event_id, recruit_id);

-- ---------------------------------------------------------------------------
-- 2) Open access: every signed-in cadre member can read/write everything.
--    Restrictive per-user policies are what block editing a shared rating.
-- ---------------------------------------------------------------------------
alter table public.ratings    enable row level security;
alter table public.attendance enable row level security;
alter table public.recruits   enable row level security;
alter table public.events     enable row level security;

do $$
declare p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('ratings','attendance','recruits','events')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy "authenticated_all" on public.ratings
  for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.attendance
  for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.recruits
  for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.events
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 3) Deleting a recruit (or a Lektion) removes its ratings + attendance.
-- ---------------------------------------------------------------------------
do $$
declare c record;
begin
  for c in
    select conname, conrelid::regclass::text as tbl
    from pg_constraint
    where contype = 'f'
      and conrelid in ('public.ratings'::regclass, 'public.attendance'::regclass)
      and confrelid in ('public.recruits'::regclass, 'public.events'::regclass)
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end $$;

alter table public.ratings
  add constraint ratings_recruit_id_fkey
  foreign key (recruit_id) references public.recruits(id) on delete cascade;
alter table public.ratings
  add constraint ratings_event_id_fkey
  foreign key (event_id) references public.events(id) on delete cascade;
alter table public.attendance
  add constraint attendance_recruit_id_fkey
  foreign key (recruit_id) references public.recruits(id) on delete cascade;
alter table public.attendance
  add constraint attendance_event_id_fkey
  foreign key (event_id) references public.events(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 4) Remove the old "inactive" recruits for good.
-- ---------------------------------------------------------------------------
delete from public.recruits where is_active = false;

-- ---------------------------------------------------------------------------
-- 5) Realtime: other phones see rating/attendance changes live.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.ratings';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.attendance';
  exception when duplicate_object then null;
  end;
end $$;
