-- Local-development role model for tenant isolation under FORCE ROW LEVEL SECURITY.
--
-- This runs automatically ONLY on a fresh Postgres data volume (the official
-- image executes /docker-entrypoint-initdb.d/*.sql once, at first init). If your
-- volume already exists, apply this manually:
--   docker compose exec -T db psql -U postgres -d epadm < docker/init/01-roles.sql
-- or `docker compose down -v` first to recreate the volume.
--
-- Roles created:
--   epadm_app  — the application runtime role. NOSUPERUSER and NOBYPASSRLS, so
--                the tenant_isolation_policy is ALWAYS enforced against it. This
--                is the role DATABASE_URL must use in every environment.
--   epadm_ops  — the control-plane role. NOSUPERUSER but BYPASSRLS, for the
--                cross-tenant operations that legitimately span tenants
--                (provisioning, login/slug resolution, webhooks, seeding,
--                metering). This is the role OPS_DATABASE_URL must use.
--
-- Migrations (drizzle-kit migrate / db:boot) run as the bootstrap superuser
-- (postgres) because they issue DDL. FORCE RLS still applies to epadm_app at
-- runtime regardless of who owns the tables, because epadm_app is neither the
-- owner-superuser nor a BYPASSRLS role.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_app') THEN
    CREATE ROLE epadm_app LOGIN PASSWORD 'epadm_app' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_ops') THEN
    CREATE ROLE epadm_ops LOGIN PASSWORD 'epadm_ops' NOSUPERUSER BYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

-- Allow both roles to use the public schema.
GRANT USAGE ON SCHEMA public TO epadm_app, epadm_ops;

-- DML on every existing table/sequence (migrations may run before or after this
-- file, so we also set default privileges below to cover tables created later).
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epadm_app, epadm_ops;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO epadm_app, epadm_ops;

-- Any future tables/sequences created by the migration role (postgres) are
-- automatically granted to the app and ops roles.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO epadm_app, epadm_ops;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO epadm_app, epadm_ops;
