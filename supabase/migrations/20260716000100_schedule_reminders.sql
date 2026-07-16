-- Schedules the send-reminders Edge Function to run every minute.
-- Requires two secrets to be created ONCE after the project is deployed (see README):
--   select vault.create_secret('<project-url>/functions/v1/send-reminders', 'edge_function_url');
--   select vault.create_secret('<service-role-key>', 'edge_function_service_role_key');
-- Secrets live in Supabase Vault rather than inline here, so no credential ends up committed to the repo.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'send-reminders-every-minute',
    '* * * * *',
    $$
    select
      net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_url'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_service_role_key')
        ),
        body := '{}'::jsonb
      );
    $$
  );
