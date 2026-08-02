# Database Roles & Tenant Isolation

EPADM enforces tenant isolation with Postgres **Row-Level Security (RLS)**. This
document describes the role model the application depends on. Getting the roles
wrong silently disables isolation, so treat this as a security-critical config.

## How isolation works

Every tenant-scoped table has a policy:

```sql
CREATE POLICY tenant_isolation_policy ON "students"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
```

The application never queries these tables on a bare connection. It uses
`withTenant(tenantId, tx => …)` (`src/lib/rls.ts`), which opens a transaction and
runs `set_config('app.current_tenant', tenantId, true)` before any statement. The
policy then restricts every read and write to that tenant's rows.

Migration `0010_force_rls.sql` upgrades every tenant table from `ENABLE` to
`FORCE ROW LEVEL SECURITY`. Without `FORCE`, the policy is skipped for the table
**owner**, so an app connecting as the owner would silently bypass isolation.

> RLS — even FORCE RLS — is **always** bypassed by superusers and by roles with
> the `BYPASSRLS` attribute. Therefore the application connection must be neither.

## The two roles

| Role        | Attributes                     | Used by            | Connection env    |
|-------------|--------------------------------|--------------------|-------------------|
| `epadm_app` | `NOSUPERUSER`, `NOBYPASSRLS`   | App request path   | `DATABASE_URL`    |
| `epadm_ops` | `NOSUPERUSER`, `BYPASSRLS`     | Control plane      | `OPS_DATABASE_URL`|

- **`epadm_app`** backs `db` (`src/lib/db/index.ts`). RLS is always enforced. All
  tenant reads/writes go through `withTenant`, which sets the tenant on the
  transaction so the policy resolves to exactly that tenant's rows.
- **`epadm_ops`** backs `opsDb` (`src/lib/db/ops.ts`). It legitimately spans
  tenants and is used only where there is no tenant session yet or the operation
  is inherently cross-tenant:
  - platform CMS (`src/lib/platform/**`)
  - tenant provisioning + registration (`api/auth/register`)
  - login / slug resolution (`api/auth/login`, `api/identity/tenant`)
  - GPS + biometric webhooks (resolve tenant by API key)
  - the demo seed (`src/lib/db/seed.ts`) and metering worker

Migrations/bootstrap (`db:migrate`, `db:boot`) issue DDL and run as the
bootstrap superuser (`postgres` locally). That is expected and does not weaken
runtime isolation, because the runtime app role is `epadm_app`.

## Local development (docker-compose)

`docker/init/01-roles.sql` creates both roles on a **fresh** data volume and
grants them DML + default privileges. Point your env at `epadm_app` for the app
and `epadm_ops` for the control plane:

```dotenv
# App runtime — RLS enforced
DATABASE_URL=postgres://epadm_app:epadm_app@localhost:5433/epadm
# Control plane — RLS bypass
OPS_DATABASE_URL=postgres://epadm_ops:epadm_ops@localhost:5433/epadm
```

Migrations still run against the superuser. `db:boot` derives an admin
connection automatically; if you run `db:migrate` directly, point `DATABASE_URL`
at `postgres` for that command, or keep a separate admin URL.

If your volume already exists (roles not created), apply the script manually:

```bash
docker compose exec -T db psql -U postgres -d epadm < docker/init/01-roles.sql
# or recreate the volume:
docker compose down -v && docker compose up -d
```

## Production checklist

- [ ] `DATABASE_URL` uses a role that is **not** a superuser and does **not**
      have `BYPASSRLS`.
- [ ] `OPS_DATABASE_URL` is set to a distinct `BYPASSRLS` role (do **not** let it
      fall back to `DATABASE_URL`; the fallback in `ops.ts` is a dev convenience).
- [ ] Migration `0010_force_rls` has been applied (`FORCE` on all 16 tenant
      tables).
- [ ] The cross-tenant RLS probe test passes (tenant A cannot read tenant B).
