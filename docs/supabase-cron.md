# Supabase Cron setup

LeetRank's durable sync worker is `POST /api/cron/snapshots`. It is safe to call
every five minutes: before 06:00 UTC and after the day's run is complete it
returns a successful no-op response.

Store the production URL and the same `CRON_SECRET` configured in Vercel inside
Supabase Vault:

```sql
select vault.create_secret('https://YOUR_APP_HOST', 'leetrank_app_url');
select vault.create_secret('YOUR_CRON_SECRET', 'leetrank_cron_secret');
```

Enable the `pg_cron` and `pg_net` extensions, then create the schedule:

```sql
select cron.schedule(
  'leetrank-sync-tick',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'leetrank_app_url') || '/api/cron/snapshots',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'leetrank_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Verify the schedule with `select * from cron.job where jobname =
'leetrank-sync-tick';`. Do not place either secret in a Prisma migration or in
client-visible environment variables.
