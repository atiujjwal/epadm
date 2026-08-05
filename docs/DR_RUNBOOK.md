# EPADM Disaster Recovery Runbook

## Recovery objectives

- RPO: 1 hour. Maximum acceptable data loss is one hour of transactions, assuming WAL shipping or hourly managed snapshots.
- RTO: 4 hours.
  - 30 minutes: detect failure and initiate recovery.
  - 90 minutes: restore database from the most recent verified backup.
  - 30 minutes: verify data integrity, migrations, and RLS policies.
  - 30 minutes: bring the application back online.
  - 30 minutes: smoke tests and monitoring verification.

## Backup schedule

- Full database dump: daily at 02:00 UTC.
- Transaction logs: continuous WAL shipping where the hosting provider supports it.
- Retention: 30 daily backups and 7 days of hourly snapshots.
- Generated local files: snapshot `generated-files/` daily or replace with object storage before production.

## Monthly backup verification checklist

1. List recent backup files and verify timestamps.
   `Get-ChildItem C:\backups | Sort-Object LastWriteTime -Descending | Select-Object -First 10`

2. Verify dump readability.
   `pg_restore --list C:\backups\latest.dump`

3. Restore to staging, never production.
   `createdb epadm_dr_test`
   `pg_restore -d epadm_dr_test C:\backups\latest.dump`

4. Verify key row counts.
   `psql epadm_dr_test -c "select count(*) from public.students"`
   `psql epadm_dr_test -c "select count(*) from public.audit_logs"`

5. Verify RLS survived restore.
   `psql epadm_dr_test -c "select tablename, rowsecurity, forcerowsecurity from pg_tables join pg_class on relname=tablename where schemaname='public' and rowsecurity = true"`

6. Run application smoke tests against the restored database.
   `npm run test -- tests/rls-isolation.test.ts`
   `npm run test -- tests/health.test.ts`

7. Drop the test restore database.
   `dropdb epadm_dr_test`

## Escalation path

1. On-call engineer: immediate response.
2. Lead engineer: within 30 minutes.
3. Stakeholder notification: within 1 hour of confirmed incident.

## DR drill checklist

- Take a staging database snapshot.
- Restore into an isolated staging database.
- Run RLS, health, route-registry, and migration smoke tests.
- Compare key table counts before/after restore.
- Record elapsed restore time, data-loss window, and issues in `docs/DR_DRILL_RESULTS.md`.
