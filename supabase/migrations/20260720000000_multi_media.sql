-- Allow more than one image/file per post

alter table posts add column if not exists media_paths text[] not null default '{}';

update posts set media_paths = array[media_path] where media_path is not null and media_paths = '{}';

alter table posts drop column if exists media_path;
