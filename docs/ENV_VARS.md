# EPADM Environment Variables

Core:

- `DATABASE_URL`: tenant-plane Postgres connection. Use a non-superuser app role with RLS enforced in production.
- `MIGRATION_DATABASE_URL`: owner connection for applying DDL migrations locally/CI. Do not use this at runtime.
- `OPS_DATABASE_URL`: ops/control-plane Postgres connection for provisioning and platform admin workflows.
- `AUTH_SECRET` or `JWT_SECRET`: tenant session token signing secret.
- `PLATFORM_AUTH_SECRET`: platform operator session token signing secret.
- `OPS_HOST`: hostname for the ops console, for example `ops.example.com`.
- `TENANT_DOMAIN_SUFFIX`: suffix for tenant hostnames.

Optional integrations:

- `REDIS_URL`: session/cache/rate-limit backing store when enabled. The app has in-memory fallbacks for local development.
- `GEMINI_API_KEY`: AI Studio/legacy AI generation provider key.
- `ANTHROPIC_API_KEY`: documented future provider key; current repo code uses Gemini unless extended.
- `CRON_SECRET`: protects admin cron endpoints.

Security:

- Set `NODE_ENV=production` in production so cookies are `secure` and production console stripping is active.
- Never commit `.env.local` or secrets.
