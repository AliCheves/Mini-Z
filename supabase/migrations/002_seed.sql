-- ═══════════════════════════════════════════════════════════
--  MINISETA RC — Seed Data (mock drivers + 1 season)
--  Run AFTER creating auth users in Supabase dashboard,
--  or use the admin panel to create profiles after auth signup.
--
--  NOTE: These are placeholder UUIDs. Replace with real
--  auth.users UUIDs after creating accounts in Supabase Auth.
-- ═══════════════════════════════════════════════════════════

-- ─── SEASON ─────────────────────────────────────────────────
insert into public.seasons (id, name, year, active) values
  ('10000000-0000-0000-0000-000000000001', 'Temporada 2025', 2025, true)
on conflict do nothing;

-- ─── CHAMPIONSHIPS ──────────────────────────────────────────
insert into public.championships (id, season_id, type, direction, order_index, active) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Stock Plástica', 'Horario',         1, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Stock Plástica', 'Anti-horario',    2, false),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Modif/Pancar',   'Horario',         3, false),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Modif/Touring',  'Anti-horario',    4, false)
on conflict do nothing;

-- ─── RACE DAYS (8 Mondays) ──────────────────────────────────
-- Champ 1 (rounds 1–4 = Mondays 1–2, 2 races each)
insert into public.race_days (id, championship_id, date, round_number, status) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2025-01-06', 1, 'completed'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '2025-01-06', 2, 'completed'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '2025-01-13', 3, 'completed'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '2025-01-13', 4, 'completed'),
-- Champ 2 (rounds 5–8)
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '2025-01-20', 5, 'completed'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', '2025-01-20', 6, 'upcoming'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', '2025-01-27', 7, 'upcoming'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '2025-01-27', 8, 'upcoming')
on conflict do nothing;

-- ─── RACES (2 per race day) ──────────────────────────────────
insert into public.races (id, race_day_id, race_number, status) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 'completed'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 2, 'completed'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 1, 'completed'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 2, 'completed'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 1, 'completed'),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', 2, 'completed'),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 1, 'completed'),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', 2, 'completed'),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', 1, 'completed'),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000005', 2, 'completed')
on conflict do nothing;

-- ─── MOCK PROFILES ───────────────────────────────────────────
-- IMPORTANT: Replace these UUIDs with real auth.users UUIDs.
-- Create users in Supabase Auth first, then insert profiles
-- using their actual UUIDs. The admin panel will also handle
-- profile creation after first login.
--
-- Placeholder comment block — actual profile inserts go here:
-- insert into public.profiles (id, role, display_name, nickname, car_number, car_type) values
--   ('<real-uuid>', 'admin', 'Race Director', 'Director', 0, null),
--   ('<real-uuid>', 'driver', 'Carlos López',   'CHARLY',  1, 'stock_plastica'),
--   ('<real-uuid>', 'driver', 'Mario García',   'MARIO',   2, 'stock_plastica'),
--   ... (11 drivers total)
