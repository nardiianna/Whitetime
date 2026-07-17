-- Sub-categories within a page (e.g. Pallavolo: Giovanile / Serie C / Serie B)

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists categories_page_id_idx on categories (page_id);

alter table categories enable row level security;

create policy "authenticated full access on categories" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table posts add column if not exists category_id uuid references categories(id) on delete set null;

create index if not exists posts_category_id_idx on posts (category_id);

insert into categories (page_id, name)
select id, category_name
from pages, unnest(array['Giovanile', 'Serie C', 'Serie B']) as category_name
where pages.name = 'Pallavolo'
on conflict do nothing;
