-- Track reminder delivery failures so a failed Telegram send is visible instead of silent

alter table posts add column if not exists reminder_error text;
