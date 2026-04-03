insert into public.stores (name, code, region)
values
  ('Millenium Central', 'MC-001', 'North'),
  ('Millenium Riverside', 'MR-014', 'West'),
  ('Millenium Grand Plaza', 'MG-027', 'South'),
  ('Millenium City Walk', 'MCW-032', 'East')
on conflict (code) do update
set
  name = excluded.name,
  region = excluded.region,
  is_active = true;

insert into public.questions (slug, title, description, sort_order, is_active)
values
  ('service', 'Service', 'How helpful and professional the staff felt.', 1, true),
  ('cleanliness', 'Cleanliness', 'How clean and presentable the store looked.', 2, true),
  ('speed', 'Speed', 'How fast the visit and checkout experience felt.', 3, true),
  ('overall', 'Overall', 'Your overall impression of the store visit.', 4, true)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
