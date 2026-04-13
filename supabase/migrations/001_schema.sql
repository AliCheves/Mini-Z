-- ═══════════════════════════════════════════════════════════
--  MINISETA RC — Database Schema
-- ═══════════════════════════════════════════════════════════

-- ─── PROFILES ───────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  role         text not null default 'driver' check (role in ('admin','driver')),
  display_name text not null,
  nickname     text,
  car_number   int,
  car_type     text check (car_type in ('stock_plastica','modif','pancar','touring')),
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- ─── SEASONS ────────────────────────────────────────────────
create table if not exists public.seasons (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  year       int  not null,
  active     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── CHAMPIONSHIPS ──────────────────────────────────────────
create table if not exists public.championships (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references public.seasons on delete cascade,
  type        text not null,   -- e.g. 'Stock Plástica', 'Modif/Pancar'
  direction   text not null,   -- 'Clockwise' | 'Anti-clockwise'
  order_index int  not null check (order_index between 1 and 4),
  active      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── RACE DAYS ──────────────────────────────────────────────
create table if not exists public.race_days (
  id               uuid primary key default gen_random_uuid(),
  championship_id  uuid not null references public.championships on delete cascade,
  date             date not null,
  round_number     int  not null,
  location         text not null default 'Pista Miniseta',
  status           text not null default 'upcoming'
    check (status in ('upcoming','qualifying','racing','completed')),
  created_at       timestamptz not null default now()
);

-- ─── QUALIFYING RESULTS ─────────────────────────────────────
create table if not exists public.qualifying_results (
  id             uuid primary key default gen_random_uuid(),
  race_day_id    uuid not null references public.race_days on delete cascade,
  driver_id      uuid not null references public.profiles on delete cascade,
  lap_time       decimal(8,3),
  grid_position  int,
  is_pole        boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (race_day_id, driver_id)
);

-- ─── RACES ──────────────────────────────────────────────────
create table if not exists public.races (
  id          uuid primary key default gen_random_uuid(),
  race_day_id uuid not null references public.race_days on delete cascade,
  race_number int  not null check (race_number in (1,2)),
  status      text not null default 'upcoming'
    check (status in ('upcoming','completed')),
  created_at  timestamptz not null default now(),
  unique (race_day_id, race_number)
);

-- ─── RACE RESULTS ───────────────────────────────────────────
create table if not exists public.race_results (
  id               uuid primary key default gen_random_uuid(),
  race_id          uuid not null references public.races on delete cascade,
  driver_id        uuid not null references public.profiles on delete cascade,
  finish_position  int,
  points_earned    int  not null default 0,
  fastest_lap      decimal(8,3),
  is_fastest_lap   boolean not null default false,
  dnf              boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (race_id, driver_id)
);

-- ─── LAP TIMES ──────────────────────────────────────────────
create table if not exists public.lap_times (
  id          uuid primary key default gen_random_uuid(),
  race_id     uuid not null references public.races on delete cascade,
  driver_id   uuid not null references public.profiles on delete cascade,
  lap_number  int  not null,
  lap_time    decimal(8,3) not null,
  recorded_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

alter table public.profiles          enable row level security;
alter table public.seasons           enable row level security;
alter table public.championships     enable row level security;
alter table public.race_days         enable row level security;
alter table public.qualifying_results enable row level security;
alter table public.races             enable row level security;
alter table public.race_results      enable row level security;
alter table public.lap_times         enable row level security;

-- Helper function: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ─── profiles ───────────────────────────────────────────────
create policy "profiles_read_authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles_write_own"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

create policy "profiles_write_admin"
  on public.profiles for all
  to authenticated using (public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated with check (auth.uid() = id);

-- ─── read-all / admin-write for static reference tables ─────
do $$ declare tbl text; begin
  foreach tbl in array array['seasons','championships','race_days','races'] loop
    execute format($f$
      create policy %I on public.%I for select to authenticated using (true);
      create policy %I on public.%I for all    to authenticated using (public.is_admin());
    $f$,
      tbl||'_read', tbl,
      tbl||'_admin_write', tbl
    );
  end loop;
end $$;

-- ─── results / lap_times ─────────────────────────────────────
do $$ declare tbl text; begin
  foreach tbl in array array['qualifying_results','race_results','lap_times'] loop
    execute format($f$
      create policy %I on public.%I for select to authenticated using (true);
      create policy %I on public.%I for all    to authenticated using (public.is_admin());
    $f$,
      tbl||'_read', tbl,
      tbl||'_admin_write', tbl
    );
  end loop;
end $$;
