-- Support a "personal" page type alongside client pages, so the same calendar
-- can also track free-time activities (beach volley, cena tra amiche, ...).

alter table pages add column if not exists type text not null default 'client'
  check (type in ('client', 'personal'));

insert into pages (name, type)
select 'Personale', 'personal'
where not exists (select 1 from pages where name = 'Personale');
