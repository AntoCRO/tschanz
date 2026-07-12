-- ============================================================================
-- Rekruten-Bewertung — komplette Schema-Einrichtung
-- Supabase → SQL Editor → New query → einfügen → Run. (Idempotent.)
--
-- WICHTIG: Im Projekt fprbqnrvymrjahezyrkl (das Projekt, auf das .env.local
-- zeigt und in dem dein Login existiert) wurden die Tabellen dieser App nie
-- angelegt — deshalb wurde nichts gespeichert und alle Listen blieben leer.
-- Dieses Skript legt sie an, ohne bestehende (fremde) Tabellen anzufassen.
-- ============================================================================

-- 1) profiles: role-Spalte für diese App + Leserechte für Mitgliederlisten.
alter table public.profiles add column if not exists role text not null default 'evaluator';

update public.profiles
  set role = 'admin'
  where email in ('anto.corkovic@outlook.de', 'corkovicanto@gmail.com');

drop policy if exists "tschanz_profiles_read" on public.profiles;
create policy "tschanz_profiles_read" on public.profiles
  for select to authenticated using (true);

-- Eigene Personendaten dürfen geändert werden, aber nicht role /
-- is_platform_admin (schliesst eine Selbst-Eskalations-Lücke der bisherigen
-- "own profile"-Policy).
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- 2) Tabellen.
create table if not exists public.recruits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  language text not null check (language in ('de', 'fr')),
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time time not null,
  chef_id uuid references public.profiles (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  recruit_id uuid not null references public.recruits (id) on delete cascade,
  evaluator_id uuid not null references public.profiles (id) on delete cascade,
  score smallint check (score is null or score between 1 and 5),
  bemerkungen text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ratings_event_recruit_key unique (event_id, recruit_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  recruit_id uuid not null references public.recruits (id) on delete cascade,
  present boolean not null default true,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint attendance_event_recruit_key unique (event_id, recruit_id)
);

create table if not exists public.sidequests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date not null,
  due_time time not null,
  done boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Erste (nie produktiv genutzte) orders-Version hatte title/needed_by statt
-- items/needed_date/needed_time — falls vorhanden, ersetzen.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'title'
  ) then
    drop table public.orders;
  end if;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('munition', 'material', 'fahrzeug', 'platz', 'zwipf')),
  items jsonb not null default '[]'::jsonb,
  description text,
  needed_date date not null,
  needed_time time not null,
  done boolean not null default false,
  completed_by uuid references public.profiles (id) on delete set null,
  completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3) updated_at automatisch pflegen (für die Upsert-Tabellen).
create or replace function public.tschanz_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tschanz_touch_ratings on public.ratings;
create trigger tschanz_touch_ratings
  before update on public.ratings
  for each row execute function public.tschanz_touch_updated_at();

drop trigger if exists tschanz_touch_attendance on public.attendance;
create trigger tschanz_touch_attendance
  before update on public.attendance
  for each row execute function public.tschanz_touch_updated_at();

-- 4) RLS: jedes angemeldete Kader-Mitglied darf lesen/schreiben; anonym nichts.
alter table public.recruits   enable row level security;
alter table public.events     enable row level security;
alter table public.ratings    enable row level security;
alter table public.attendance enable row level security;
alter table public.sidequests enable row level security;
alter table public.orders     enable row level security;

drop policy if exists "authenticated_all" on public.recruits;
create policy "authenticated_all" on public.recruits
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated_all" on public.events;
create policy "authenticated_all" on public.events
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated_all" on public.ratings;
create policy "authenticated_all" on public.ratings
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated_all" on public.attendance;
create policy "authenticated_all" on public.attendance
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated_all" on public.sidequests;
create policy "authenticated_all" on public.sidequests
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated_all" on public.orders;
create policy "authenticated_all" on public.orders
  for all to authenticated using (true) with check (true);

-- 5) Realtime: andere Geräte sehen Bewertungs-/Anwesenheits-Änderungen live.
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
