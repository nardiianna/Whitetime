-- Content planner schema: pages managed, scheduled posts, content ideas bank

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instagram_username text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  caption text not null default '',
  media_path text,
  scheduled_at timestamptz not null,
  status text not null default 'da_fare'
    check (status in ('idea', 'da_fare', 'programmato', 'promemoria_inviato', 'pubblicato')),
  reminder_sent boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_scheduled_at_idx on posts (scheduled_at);
create index if not exists posts_page_id_idx on posts (page_id);

create table if not exists content_ideas (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  idea_text text not null,
  pillar text,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists content_ideas_page_id_idx on content_ideas (page_id);

-- Seed the 3 pages Anna manages
insert into pages (name, instagram_username) values
  ('Pallavolo', null),
  ('Centro Sportivo', null),
  ('Magnetica Design', null)
on conflict do nothing;

-- Row Level Security: single-user personal app, any authenticated user (i.e. Anna, logged in) can manage everything
alter table pages enable row level security;
alter table posts enable row level security;
alter table content_ideas enable row level security;

create policy "authenticated full access on pages" on pages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access on posts" on posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access on content_ideas" on content_ideas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- updated_at trigger for posts
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

-- Storage bucket for post media, public read (so Telegram can fetch images by URL)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');

create policy "authenticated write media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

create policy "authenticated update media" on storage.objects
  for update to authenticated using (bucket_id = 'media');

create policy "authenticated delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
